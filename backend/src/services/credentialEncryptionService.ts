import crypto from 'crypto';
import { credentialEncryptionKey } from '../config/aws';

interface EncryptedCredentials {
  encryptedData: string;
  iv: string;
  tag: string;
}

interface DecryptedCredentials {
  loginMethod: 'facebook' | 'twitter';
  loginId: string;
  password: string;
  additionalInstructions?: string;
}

export class CredentialEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  private getEncryptionKey(): Buffer {
    // In production, this should come from AWS KMS or a secure key management service
    const keyString = credentialEncryptionKey();
    
    if (!keyString) {
      throw new Error('Credential encryption key not configured');
    }

    // Ensure the key is exactly 32 bytes (256 bits)
    return crypto.scryptSync(keyString, 'salt', this.keyLength);
  }

  /**
   * Encrypt credentials using AES-256-GCM
   */
  public encryptCredentials(credentials: DecryptedCredentials): EncryptedCredentials {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('bgmi-credentials', 'utf8'));
      
      let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Error encrypting credentials:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt credentials using AES-256-GCM
   */
  public decryptCredentials(encryptedCredentials: EncryptedCredentials): DecryptedCredentials {
    try {
      const key = this.getEncryptionKey();
      const iv = Buffer.from(encryptedCredentials.iv, 'hex');
      const tag = Buffer.from(encryptedCredentials.tag, 'hex');
      
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('bgmi-credentials', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedCredentials.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted) as DecryptedCredentials;
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Hash credentials for storage (one-way hash for verification)
   */
  public hashCredentials(credentials: DecryptedCredentials): string {
    const credentialString = `${credentials.loginMethod}:${credentials.loginId}:${credentials.password}`;
    return crypto.createHash('sha256').update(credentialString).digest('hex');
  }

  /**
   * Generate a secure random token for credential access
   */
  public generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify credentials without decrypting (for admin testing)
   */
  public verifyCredentials(encryptedCredentials: EncryptedCredentials, testCredentials: Partial<DecryptedCredentials>): boolean {
    try {
      const decrypted = this.decryptCredentials(encryptedCredentials);
      
      // Only verify the parts that are provided
      if (testCredentials.loginMethod && decrypted.loginMethod !== testCredentials.loginMethod) {
        return false;
      }
      
      if (testCredentials.loginId && decrypted.loginId !== testCredentials.loginId) {
        return false;
      }
      
      if (testCredentials.password && decrypted.password !== testCredentials.password) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return false;
    }
  }

  /**
   * Audit log for credential access
   */
  public logCredentialAccess(listingId: string, action: 'encrypt' | 'decrypt' | 'verify' | 'deactivate', adminId?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      listingId,
      action,
      adminId,
      ip: '127.0.0.1', // In production, get from request
      userAgent: 'BGMI-Admin-Portal' // In production, get from request
    };

    console.log('Credential Access Log:', JSON.stringify(logEntry));
    
    // In production, send to CloudWatch or other logging service
    // await this.sendToLoggingService(logEntry);
  }

  /**
   * Secure credential storage with metadata
   */
  public createSecureStorage(credentials: DecryptedCredentials, listingId: string, sellerId: string) {
    const encrypted = this.encryptCredentials(credentials);
    const hash = this.hashCredentials(credentials);
    const accessToken = this.generateAccessToken();
    
    const secureStorage = {
      listingId,
      sellerId,
      encryptedCredentials: encrypted,
      credentialHash: hash,
      accessToken,
      createdAt: new Date().toISOString(),
      lastAccessed: null as string | null,
      accessCount: 0,
      isActive: true
    };

    this.logCredentialAccess(listingId, 'encrypt');
    
    return secureStorage;
  }

  /**
   * Retrieve and decrypt credentials with access control
   */
  public retrieveCredentials(secureStorage: any, adminId: string): DecryptedCredentials {
    if (!secureStorage.isActive) {
      throw new Error('Credential storage is not active');
    }

    // Update access tracking
    secureStorage.lastAccessed = new Date().toISOString();
    secureStorage.accessCount += 1;

    this.logCredentialAccess(secureStorage.listingId, 'decrypt', adminId);

    return this.decryptCredentials(secureStorage.encryptedCredentials);
  }

  /**
   * Deactivate credential storage (after safe period)
   */
  public deactivateCredentials(secureStorage: any, adminId: string): void {
    secureStorage.isActive = false;
    secureStorage.deactivatedAt = new Date().toISOString();
    secureStorage.deactivatedBy = adminId;

    this.logCredentialAccess(secureStorage.listingId, 'deactivate', adminId);
  }
}

// Export singleton instance
export const credentialEncryptionService = new CredentialEncryptionService();
