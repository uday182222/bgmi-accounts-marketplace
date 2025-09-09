import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { AppError } from './errorHandler';
import { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_USER_POOL_CLIENT_ID } from '../config/aws';

// Lazy initialization of JWKS client
let client: any = null;

function getJwksClient() {
  if (!client) {
    client = jwksClient({
      jwksUri: `https://cognito-idp.${AWS_REGION()}.amazonaws.com/${COGNITO_USER_POOL_ID()}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 3600000 // 1 hour in milliseconds
    });
  }
  return client;
}

// Function to get signing key from JWKS
async function getSigningKey(kid: string): Promise<string> {
  const jwksClient = getJwksClient();
  
  return new Promise((resolve, reject) => {
    jwksClient.getSigningKey(kid, (err: Error | null, key?: any) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!key) {
        reject(new Error(`No key found for kid: ${kid}`));
        return;
      }
      
      const signingKey = key.getPublicKey();
      resolve(signingKey);
    });
  });
}

// Cognito JWT payload interface
interface CognitoJwtPayload {
  sub: string; // Cognito user ID
  aud: string; // Client ID
  iss: string; // Issuer
  token_use: string; // 'id' or 'access'
  auth_time: number;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  given_name?: string;
  family_name?: string;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  [key: string]: any;
}

// Request interface is already declared in auth.ts

export const authenticateCognito = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No valid token provided.', 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    // Debug: Log token information
    console.log("🔎 Raw token (first 50 chars):", token.substring(0, 50) + "...");

    try {
      const parts = token.split(".");
      console.log("🧩 Token parts:", parts.length);
      if (parts.length === 3 && parts[0]) {
        const headerJson = Buffer.from(parts[0], "base64").toString("utf-8");
        console.log("📝 Decoded header JSON:", headerJson);
      }
    } catch (e: any) {
      console.error("⚠️ Failed to decode token header manually:", e?.message || e);
    }

    // Step 1: Decode JWT header to extract kid
    const decodedHeader = jwt.decode(token, { complete: true });
    console.log("🔍 Decoded header object:", JSON.stringify(decodedHeader?.header, null, 2));
    
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
      console.error("❌ Missing kid in JWT header. Header:", decodedHeader?.header);
      throw new AppError('Invalid token format. Missing kid in header.', 401);
    }

    const kid = decodedHeader.header.kid;
    console.log('🔍 JWT Header decoded, kid:', kid);

    // Step 2: Get the signing key from JWKS
    const signingKey = await getSigningKey(kid);
    console.log('🔑 Signing key retrieved for kid:', kid);

    // Step 3: Verify JWT token with the correct key
    const decoded = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${AWS_REGION()}.amazonaws.com/${COGNITO_USER_POOL_ID()}`,
      audience: COGNITO_USER_POOL_CLIENT_ID(),
      clockTolerance: 30, // 30 seconds tolerance for clock skew
    }) as CognitoJwtPayload;

    // Debug: Log token payload information
    console.log("🔍 Token payload:", JSON.stringify({
      token_use: decoded.token_use,
      sub: decoded.sub,
      aud: decoded.aud,
      iss: decoded.iss,
      email: decoded.email,
      'cognito:groups': decoded['cognito:groups']
    }, null, 2));

    // Validate token use (accept both 'id' and 'access' tokens)
    if (decoded.token_use !== 'id' && decoded.token_use !== 'access') {
      console.error("❌ Invalid token type:", decoded.token_use);
      throw new AppError(`Invalid token type. Expected 'id' or 'access' token, got '${decoded.token_use}'.`, 401);
    }

    // Determine user role from Cognito groups or default to 'buyer'
    let role = 'buyer';
    if (decoded['cognito:groups'] && decoded['cognito:groups'].length > 0) {
      // Check for admin role first, then seller
      if (decoded['cognito:groups'].includes('admin')) {
        role = 'admin';
      } else if (decoded['cognito:groups'].includes('seller')) {
        role = 'seller';
      }
    }

    // Extract user information
    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      role: role,
      cognitoId: decoded.sub,
      phone: decoded.phone_number,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      groups: decoded['cognito:groups'] || [],
      username: decoded['cognito:username'] || decoded.sub,
    };

    console.log('✅ Cognito authentication successful:', {
      cognitoId: req.user?.cognitoId,
      email: req.user?.email,
      role: req.user?.role,
      groups: req.user?.groups
    });

    next();
  } catch (error: any) {
    console.error('❌ Cognito authentication failed:', error.message);
    
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        next(new AppError('Token expired', 401));
      } else if (error.name === 'NotBeforeError') {
        next(new AppError('Token not active', 401));
      } else {
        next(new AppError('Invalid token', 401));
      }
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else if (error instanceof jwt.NotBeforeError) {
      next(new AppError('Token not active', 401));
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

// Role-based authorization middleware
export const authorizeCognito = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

// Group-based authorization middleware
export const authorizeGroups = (...groups: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Access denied. User not authenticated.', 401));
    }

    const userGroups = req.user.groups || [];
    const hasRequiredGroup = groups.some(group => userGroups.includes(group));
    if (!hasRequiredGroup) {
      return next(new AppError('Access denied. Required group membership not found.', 403));
    }

    next();
  };
};
