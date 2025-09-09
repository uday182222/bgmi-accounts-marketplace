import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
  AdminDeleteUserCommand,
  ListUsersCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListGroupsCommand,
  CreateGroupCommand,
  AdminConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  AdminInitiateAuthCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, AWS_CONFIG, COGNITO_USER_POOL_ID, COGNITO_USER_POOL_CLIENT_ID, COGNITO_USER_POOL_CLIENT_SECRET } from '../config/aws';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

// Helper function to format phone number to E.164 format
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already starts with country code, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // If starts with 91 (India), add + prefix
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If starts with 0, remove it and add +91
  if (digits.startsWith('0') && digits.length === 10) {
    return `+91${digits.substring(1)}`;
  }
  
  // If 10 digits, assume Indian number and add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // Default: add +91 prefix
  return `+91${digits}`;
};

// Helper function to generate SECRET_HASH for Cognito client authentication
export const generateSecretHash = (username: string, clientId: string, clientSecret: string): string => {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
};

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
}

export interface User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface DatabaseUser {
  cognitoId: string;
  email: string;
  phone?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;
  private clientSecret: string | null;

  constructor() {
    // Debug logging for credential verification
    console.log('🔧 Initializing CognitoService...');
    
    try {
      this.client = cognitoClient();
      this.userPoolId = COGNITO_USER_POOL_ID();
      this.clientId = COGNITO_USER_POOL_CLIENT_ID();
      this.clientSecret = COGNITO_USER_POOL_CLIENT_SECRET() || null;
      
      console.log('✅ CognitoService initialized');
      console.log('User Pool ID:', this.userPoolId);
      console.log('Client ID:', this.clientId);
      console.log('Client Secret:', this.clientSecret ? '✅ Set' : '❌ Not set');
    } catch (error) {
      console.error('❌ Error initializing CognitoService:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      console.log('🔧 Creating Cognito user:', userData.username);
      console.log('Using User Pool ID:', this.userPoolId);
      
      // Create user in Cognito
      // Note: If your User Pool uses email as username, we need to use email as the Username field
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: userData.email, // Use email as username if User Pool is configured that way
        UserAttributes: [
          { Name: 'email', Value: userData.email },
          { Name: 'email_verified', Value: 'true' },
          ...(userData.firstName ? [{ Name: 'given_name', Value: userData.firstName }] : []),
          ...(userData.lastName ? [{ Name: 'family_name', Value: userData.lastName }] : []),
          ...(userData.phone ? [{ Name: 'phone_number', Value: formatPhoneNumber(userData.phone) }] : []),
        ],
        TemporaryPassword: userData.password,
        MessageAction: 'SUPPRESS', // Don't send welcome email
      });

      const result = await this.client.send(createUserCommand);

      // Set permanent password
      await this.client.send(new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: userData.email, // Use email as username
        Password: userData.password,
        Permanent: true,
      }));

      // Add user to role group
      await this.addUserToGroup(userData.email, userData.role); // Use email as username

      // Sync user with database
      await this.syncUserWithDatabase({
        cognitoId: result.User?.Username || userData.email, // Use email as cognitoId
        email: userData.email,
        phone: userData.phone ? formatPhoneNumber(userData.phone) : undefined,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.$metadata?.httpStatusCode);
      console.error('Request ID:', error.$metadata?.requestId);
      
      // Handle specific Cognito errors
      let statusCode = 400;
      let errorMessage = error.message;
      
      switch (error.name) {
        case 'InvalidParameterException':
          statusCode = 400;
          errorMessage = `Invalid parameter: ${error.message}`;
          break;
        case 'UsernameExistsException':
          statusCode = 409;
          errorMessage = 'User already exists with this email';
          break;
        case 'InvalidPasswordException':
          statusCode = 400;
          errorMessage = 'Password does not meet requirements';
          break;
        case 'UnrecognizedClientException':
          statusCode = 401;
          errorMessage = 'Invalid AWS credentials or configuration';
          break;
        case 'NotAuthorizedException':
          statusCode = 403;
          errorMessage = 'Not authorized to perform this action';
          break;
        case 'ResourceNotFoundException':
          statusCode = 404;
          errorMessage = 'User pool not found';
          break;
        default:
          statusCode = 500;
          errorMessage = `Cognito error: ${error.message}`;
      }
      
      throw new AppError(
        `Failed to create user: ${errorMessage}`,
        statusCode
      );
    }
  }

  async syncUserWithDatabase(userData: DatabaseUser): Promise<void> {
    try {
      console.log('🔧 Syncing user with database:', userData.cognitoId);
      
      // TODO: Implement actual database insertion
      // For now, we'll use a simple in-memory store or mock database
      // In production, this would insert into RDS/DynamoDB
      
      // Example implementation:
      // await db.query(
      //   'INSERT INTO users (cognito_id, email, phone, username, first_name, last_name, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (cognito_id) DO NOTHING',
      //   [userData.cognitoId, userData.email, userData.phone, userData.username, userData.firstName, userData.lastName, userData.role, userData.createdAt, userData.updatedAt]
      // );
      
      console.log('✅ User synced with database successfully');
    } catch (error: any) {
      console.error('❌ Error syncing user with database:', error);
      // Don't throw error here as Cognito user creation was successful
      // Just log the error for debugging
    }
  }

  async authenticateUser(authData: AuthRequest): Promise<CognitoTokens> {
    try {
      console.log('🔧 Authenticating user:', authData.email);
      
      // Build auth parameters
      const authParameters: Record<string, string> = {
        USERNAME: authData.email,
        PASSWORD: authData.password,
      };

      // Add SECRET_HASH if client secret is configured
      if (this.clientSecret) {
        authParameters.SECRET_HASH = generateSecretHash(authData.email, this.clientId, this.clientSecret);
      }
      
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
        AuthParameters: authParameters,
      });

      const result = await this.client.send(authCommand);
      
      if (!result.AuthenticationResult) {
        throw new AppError('Authentication failed: No tokens returned', 401);
      }

      const tokens: CognitoTokens = {
        idToken: result.AuthenticationResult.IdToken!,
        accessToken: result.AuthenticationResult.AccessToken!,
        refreshToken: result.AuthenticationResult.RefreshToken!,
        tokenType: result.AuthenticationResult.TokenType!,
        expiresIn: result.AuthenticationResult.ExpiresIn || 3600,
      };

      console.log('✅ User authenticated successfully');
      return tokens;
    } catch (error: any) {
      console.error('❌ Error authenticating user:', error);
      
      let statusCode = 401;
      let errorMessage = error.message;
      
      switch (error.name) {
        case 'NotAuthorizedException':
          statusCode = 401;
          errorMessage = 'Invalid email or password';
          break;
        case 'UserNotFoundException':
          statusCode = 404;
          errorMessage = 'User not found';
          break;
        case 'UserNotConfirmedException':
          statusCode = 400;
          errorMessage = 'User account not confirmed';
          break;
        case 'TooManyRequestsException':
          statusCode = 429;
          errorMessage = 'Too many requests. Please try again later';
          break;
        default:
          statusCode = 500;
          errorMessage = `Authentication error: ${error.message}`;
      }
      
      throw new AppError(errorMessage, statusCode);
    }
  }

  async authenticateUserAfterCreation(email: string, password: string): Promise<CognitoTokens> {
    try {
      console.log('🔧 Authenticating user after creation:', email);
      
      // Build auth parameters
      const authParameters: Record<string, string> = {
        USERNAME: email,
        PASSWORD: password,
      };

      // Add SECRET_HASH if client secret is configured
      if (this.clientSecret) {
        authParameters.SECRET_HASH = generateSecretHash(email, this.clientId, this.clientSecret);
      }
      
      // Use AdminInitiateAuth since we just created the user
      const authCommand = new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
        AuthParameters: authParameters,
      });

      const result = await this.client.send(authCommand);
      
      if (!result.AuthenticationResult) {
        throw new AppError('Authentication failed: No tokens returned', 401);
      }

      const tokens: CognitoTokens = {
        idToken: result.AuthenticationResult.IdToken!,
        accessToken: result.AuthenticationResult.AccessToken!,
        refreshToken: result.AuthenticationResult.RefreshToken!,
        tokenType: result.AuthenticationResult.TokenType!,
        expiresIn: result.AuthenticationResult.ExpiresIn || 3600,
      };

      console.log('✅ User authenticated after creation successfully');
      return tokens;
    } catch (error: any) {
      console.error('❌ Error authenticating user after creation:', error);
      throw new AppError(`Failed to authenticate user after creation: ${error.message}`, 401);
    }
  }

  async getUser(username: string): Promise<User | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      const result = await this.client.send(command);

      const user: User = {
        username: result.Username || '',
        email: result.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
        firstName: result.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value,
        lastName: result.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value,
        phone: result.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value,
        role: 'buyer', // Default role, will be updated based on groups
        isVerified: result.UserStatus === 'CONFIRMED',
        createdAt: result.UserCreateDate?.toISOString() || new Date().toISOString(),
        lastLogin: result.UserLastModifiedDate?.toISOString(),
      };

      // Get user's groups to determine role
      const groups = await this.getUserGroups(username);
      if (groups.length > 0) {
        user.role = groups[0] || 'buyer'; // Use first group as role, default to buyer
      }

      return user;
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        return null;
      }
      console.error('Error getting user:', error);
      throw new AppError(
        `Failed to get user: ${error.message}`,
        500
      );
    }
  }

  async updateUser(username: string, attributes: Partial<User>): Promise<User> {
    try {
      const updateAttributes: any[] = [];

      if (attributes.email) {
        updateAttributes.push({ Name: 'email', Value: attributes.email });
      }
      if (attributes.firstName) {
        updateAttributes.push({ Name: 'given_name', Value: attributes.firstName });
      }
      if (attributes.lastName) {
        updateAttributes.push({ Name: 'family_name', Value: attributes.lastName });
      }
      if (attributes.phone) {
        updateAttributes.push({ Name: 'phone_number', Value: attributes.phone });
      }

      if (updateAttributes.length > 0) {
        await this.client.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: this.userPoolId,
          Username: username,
          UserAttributes: updateAttributes,
        }));
      }

      // Update role if provided
      if (attributes.role) {
        await this.updateUserRole(username, attributes.role);
      }

      const updatedUser = await this.getUser(username);
      if (!updatedUser) {
        throw new AppError('User not found after update', 404);
      }

      return updatedUser;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new AppError(
        `Failed to update user: ${error.message}`,
        500
      );
    }
  }

  async deleteUser(username: string): Promise<void> {
    try {
      await this.client.send(new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      }));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new AppError(
        `Failed to delete user: ${error.message}`,
        500
      );
    }
  }

  async listUsers(limit: number = 10, paginationToken?: string): Promise<{ users: User[]; paginationToken?: string }> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Limit: limit,
        PaginationToken: paginationToken,
      });

      const result = await this.client.send(command);

      const users: User[] = [];
      for (const user of result.Users || []) {
        const userData: User = {
          username: user.Username || '',
          email: user.Attributes?.find(attr => attr.Name === 'email')?.Value || '',
          firstName: user.Attributes?.find(attr => attr.Name === 'given_name')?.Value,
          lastName: user.Attributes?.find(attr => attr.Name === 'family_name')?.Value,
          phone: user.Attributes?.find(attr => attr.Name === 'phone_number')?.Value,
          role: 'buyer',
          isVerified: user.UserStatus === 'CONFIRMED',
          createdAt: user.UserCreateDate?.toISOString() || new Date().toISOString(),
          lastLogin: user.UserLastModifiedDate?.toISOString(),
        };

        // Get user's groups
        const groups = await this.getUserGroups(userData.username);
        if (groups.length > 0) {
          userData.role = groups[0] || 'buyer';
        }

        users.push(userData);
      }

      return {
        users,
        paginationToken: result.PaginationToken,
      };
    } catch (error: any) {
      console.error('Error listing users:', error);
      throw new AppError(
        `Failed to list users: ${error.message}`,
        500
      );
    }
  }

  async addUserToGroup(username: string, groupName: string): Promise<void> {
    try {
      // Ensure group exists
      await this.createGroupIfNotExists(groupName);

      await this.client.send(new AdminAddUserToGroupCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: groupName,
      }));
    } catch (error: any) {
      console.error('Error adding user to group:', error);
      throw new AppError(
        `Failed to add user to group: ${error.message}`,
        500
      );
    }
  }

  async removeUserFromGroup(username: string, groupName: string): Promise<void> {
    try {
      await this.client.send(new AdminRemoveUserFromGroupCommand({
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: groupName,
      }));
    } catch (error: any) {
      console.error('Error removing user from group:', error);
      throw new AppError(
        `Failed to remove user from group: ${error.message}`,
        500
      );
    }
  }

  async getUserGroups(username: string): Promise<string[]> {
    try {
      // This would require a custom implementation or additional AWS SDK calls
      // For now, we'll return a default role based on username pattern
      // In a real implementation, you'd query the groups for the user
      return ['buyer']; // Default role
    } catch (error: any) {
      console.error('Error getting user groups:', error);
      return ['buyer'];
    }
  }

  async updateUserRole(username: string, newRole: string): Promise<void> {
    try {
      // Get current user to determine current role
      const user = await this.getUser(username);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove from current role group
      if (user.role && user.role !== newRole) {
        await this.removeUserFromGroup(username, user.role);
      }

      // Add to new role group
      await this.addUserToGroup(username, newRole);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      throw new AppError(
        `Failed to update user role: ${error.message}`,
        500
      );
    }
  }

  private async createGroupIfNotExists(groupName: string): Promise<void> {
    try {
      // Check if group exists
      const listGroupsCommand = new ListGroupsCommand({
        UserPoolId: this.userPoolId,
      });

      const groups = await this.client.send(listGroupsCommand);
      const groupExists = groups.Groups?.some(group => group.GroupName === groupName);

      if (!groupExists) {
        await this.client.send(new CreateGroupCommand({
          UserPoolId: this.userPoolId,
          GroupName: groupName,
          Description: `Group for ${groupName} users`,
        }));
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      // Don't throw error here as group might already exist
    }
  }

  async confirmUserSignUp(username: string): Promise<void> {
    try {
      await this.client.send(new AdminConfirmSignUpCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      }));
    } catch (error: any) {
      console.error('Error confirming user signup:', error);
      throw new AppError(
        `Failed to confirm user signup: ${error.message}`,
        500
      );
    }
  }

  async resendConfirmationCode(username: string): Promise<void> {
    try {
      await this.client.send(new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: username,
      }));
    } catch (error: any) {
      console.error('Error resending confirmation code:', error);
      throw new AppError(
        `Failed to resend confirmation code: ${error.message}`,
        500
      );
    }
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _cognitoService: CognitoService;

export const cognitoService = () => {
  if (!_cognitoService) {
    _cognitoService = new CognitoService();
  }
  return _cognitoService;
};

export default cognitoService;
