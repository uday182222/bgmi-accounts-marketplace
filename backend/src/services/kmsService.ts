import {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
  GenerateDataKeyCommand,
  CreateKeyCommand,
  DescribeKeyCommand
} from '@aws-sdk/client-kms';
import { AWS_CONFIG } from '../config/aws';
import { AppError } from '../middleware/errorHandler';

class KMSService {
  private client: KMSClient;
  private keyId: string;

  constructor() {
    this.client = new KMSClient({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      },
    });
    this.keyId = AWS_CONFIG.kmsKeyId || 'alias/bgmi-accounts-credentials';
  }

  async encryptCredentials(credentials: {
    email: string;
    password: string;
    recoveryEmail?: string;
  }): Promise<{
    encryptedCredentials: string;
    dataKey: string;
  }> {
    try {
      // Generate a data key for this encryption
      const dataKeyCommand = new GenerateDataKeyCommand({
        KeyId: this.keyId,
        KeySpec: 'AES_256',
      });

      const dataKeyResponse = await this.client.send(dataKeyCommand);
      
      if (!dataKeyResponse.Plaintext || !dataKeyResponse.CiphertextBlob) {
        throw new Error('Failed to generate data key');
      }

      // Encrypt credentials using the data key
      const credentialsString = JSON.stringify(credentials);
      const credentialsBuffer = Buffer.from(credentialsString, 'utf8');
      
      // For simplicity, we'll use the KMS encrypt command directly
      // In production, you might want to use the data key for local encryption
      const encryptCommand = new EncryptCommand({
        KeyId: this.keyId,
        Plaintext: credentialsBuffer,
      });

      const encryptResponse = await this.client.send(encryptCommand);
      
      if (!encryptResponse.CiphertextBlob) {
        throw new Error('Failed to encrypt credentials');
      }

      return {
        encryptedCredentials: Buffer.from(encryptResponse.CiphertextBlob!).toString('base64'),
        dataKey: Buffer.from(dataKeyResponse.CiphertextBlob!).toString('base64'),
      };
    } catch (error: any) {
      console.error('Error encrypting credentials:', error);
      throw new AppError(
        `Failed to encrypt credentials: ${error.message}`,
        500
      );
    }
  }

  async decryptCredentials(
    encryptedCredentials: string,
    dataKey: string
  ): Promise<{
    email: string;
    password: string;
    recoveryEmail?: string;
  }> {
    try {
      // First decrypt the data key
      const decryptDataKeyCommand = new DecryptCommand({
        CiphertextBlob: Buffer.from(dataKey, 'base64'),
      });

      const dataKeyResponse = await this.client.send(decryptDataKeyCommand);
      
      if (!dataKeyResponse.Plaintext) {
        throw new Error('Failed to decrypt data key');
      }

      // Decrypt the credentials
      const decryptCommand = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedCredentials, 'base64'),
      });

      const decryptResponse = await this.client.send(decryptCommand);
      
      if (!decryptResponse.Plaintext) {
        throw new Error('Failed to decrypt credentials');
      }

      const credentialsString = Buffer.from(decryptResponse.Plaintext!).toString('utf8');
      return JSON.parse(credentialsString);
    } catch (error: any) {
      console.error('Error decrypting credentials:', error);
      throw new AppError(
        `Failed to decrypt credentials: ${error.message}`,
        500
      );
    }
  }

  async createKeyIfNotExists(): Promise<string> {
    try {
      // Check if key exists
      const describeCommand = new DescribeKeyCommand({
        KeyId: this.keyId,
      });

      try {
        await this.client.send(describeCommand);
        return this.keyId;
      } catch (error: any) {
        if (error.name !== 'NotFoundException') {
          throw error;
        }
      }

      // Create the key if it doesn't exist
      const createCommand = new CreateKeyCommand({
        Description: 'KMS key for BGMI accounts service credential encryption',
        KeyUsage: 'ENCRYPT_DECRYPT',
        KeySpec: 'SYMMETRIC_DEFAULT',
        Origin: 'AWS_KMS',
      });

      const createResponse = await this.client.send(createCommand);
      
      if (!createResponse.KeyMetadata?.KeyId) {
        throw new Error('Failed to create KMS key');
      }

      return createResponse.KeyMetadata.KeyId;
    } catch (error: any) {
      console.error('Error creating KMS key:', error);
      throw new AppError(
        `Failed to create KMS key: ${error.message}`,
        500
      );
    }
  }

  async encryptText(text: string): Promise<string> {
    try {
      const command = new EncryptCommand({
        KeyId: this.keyId,
        Plaintext: Buffer.from(text, 'utf8'),
      });

      const response = await this.client.send(command);
      
      if (!response.CiphertextBlob) {
        throw new Error('Failed to encrypt text');
      }

      return Buffer.from(response.CiphertextBlob!).toString('base64');
    } catch (error: any) {
      console.error('Error encrypting text:', error);
      throw new AppError(
        `Failed to encrypt text: ${error.message}`,
        500
      );
    }
  }

  async decryptText(encryptedText: string): Promise<string> {
    try {
      const command = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedText, 'base64'),
      });

      const response = await this.client.send(command);
      
      if (!response.Plaintext) {
        throw new Error('Failed to decrypt text');
      }

      return Buffer.from(response.Plaintext!).toString('utf8');
    } catch (error: any) {
      console.error('Error decrypting text:', error);
      throw new AppError(
        `Failed to decrypt text: ${error.message}`,
        500
      );
    }
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _kmsService: KMSService;

export const kmsService = () => {
  if (!_kmsService) {
    _kmsService = new KMSService();
  }
  return _kmsService;
};

export default kmsService;
