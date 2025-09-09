import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { s3Client, kmsClient, AWS_CONFIG } from '../config/aws';
import { AppError } from '../middleware/errorHandler';

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';
  fileName: string;
  s3Key: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
  metadata: {
    fileSize: number;
    mimeType: string;
    checksum: string;
  };
}

export interface KYCApplication {
  id: string;
  userId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  documents: KYCDocument[];
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

class KYCService {
  private readonly bucketName: string;
  private readonly kmsKeyId: string;
  private readonly documentPrefix = 'kyc-documents';

  constructor() {
    this.bucketName = AWS_CONFIG.s3BucketName;
    this.kmsKeyId = AWS_CONFIG.kmsKeyId;
  }

  /**
   * Upload a KYC document to S3 with encryption
   */
  async uploadDocument(
    userId: string,
    documentType: KYCDocument['type'],
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<KYCDocument> {
    try {
      const documentId = `kyc_${userId}_${documentType}_${Date.now()}`;
      const s3Key = `${this.documentPrefix}/${userId}/${documentId}`;
      
      // Encrypt the file content
      const encryptedFile = await this.encryptFile(file);
      
      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: encryptedFile,
        ContentType: mimeType,
        ServerSideEncryption: 'aws:kms',
        SSEKMSKeyId: this.kmsKeyId,
        Metadata: {
          userId,
          documentType,
          originalFileName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client().send(uploadCommand);

      // Calculate checksum
      const checksum = await this.calculateChecksum(file);

      const document: KYCDocument = {
        id: documentId,
        userId,
        type: documentType,
        fileName,
        s3Key,
        status: 'uploaded',
        uploadedAt: new Date(),
        metadata: {
          fileSize: file.length,
          mimeType,
          checksum,
        },
      };

      return document;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw new AppError('Failed to upload document', 500);
    }
  }

  /**
   * Retrieve a KYC document from S3
   */
  async getDocument(documentId: string, userId: string): Promise<{ file: Buffer; mimeType: string }> {
    try {
      const s3Key = `${this.documentPrefix}/${userId}/${documentId}`;
      
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await s3Client().send(getCommand);
      
      if (!response.Body) {
        throw new AppError('Document not found', 404);
      }

      const fileBuffer = Buffer.from(await response.Body.transformToByteArray());
      const decryptedFile = await this.decryptFile(fileBuffer);
      
      return {
        file: decryptedFile,
        mimeType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error retrieving KYC document:', error);
      throw new AppError('Failed to retrieve document', 500);
    }
  }

  /**
   * Delete a KYC document from S3
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const s3Key = `${this.documentPrefix}/${userId}/${documentId}`;
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await s3Client().send(deleteCommand);
    } catch (error) {
      console.error('Error deleting KYC document:', error);
      throw new AppError('Failed to delete document', 500);
    }
  }

  /**
   * Create a new KYC application
   */
  async createKYCApplication(
    userId: string,
    personalInfo: KYCApplication['personalInfo']
  ): Promise<KYCApplication> {
    const application: KYCApplication = {
      id: `kyc_app_${userId}_${Date.now()}`,
      userId,
      status: 'draft',
      personalInfo,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would be stored in DynamoDB
    // For now, we'll return the application object
    return application;
  }

  /**
   * Submit a KYC application for review
   */
  async submitKYCApplication(
    applicationId: string,
    documents: KYCDocument[]
  ): Promise<KYCApplication> {
    // Validate that all required documents are present
    const requiredTypes = ['id_front', 'id_back', 'selfie'] as const;
    const hasRequiredDocs = requiredTypes.every(type => 
      documents.some(doc => doc.type === type && doc.status === 'uploaded')
    );

    if (!hasRequiredDocs) {
      throw new AppError('Missing required documents', 400);
    }

    // Update application status
    const application: KYCApplication = {
      id: applicationId,
      userId: documents[0]?.userId || '',
      status: 'submitted',
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },
      documents,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would update the database
    // and trigger notifications to admin team

    return application;
  }

  /**
   * Review a KYC application (admin only)
   */
  async reviewKYCApplication(
    applicationId: string,
    decision: 'approved' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<KYCApplication> {
    // In a real implementation, this would:
    // 1. Update the application status in the database
    // 2. Update document statuses
    // 3. Send notifications to the user
    // 4. Update user permissions if approved

    const application: KYCApplication = {
      id: applicationId,
      userId: '',
      status: decision,
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },
      documents: [],
      submittedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy,
      rejectionReason: decision === 'rejected' ? rejectionReason : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return application;
  }

  /**
   * Get KYC application status for a user
   */
  async getKYCStatus(userId: string): Promise<{
    status: KYCApplication['status'];
    application?: KYCApplication;
  }> {
    // In a real implementation, this would query the database
    // For now, return a mock status
    return {
      status: 'draft' as KYCApplication['status'],
    };
  }

  /**
   * Encrypt file content using KMS
   */
  private async encryptFile(file: Buffer): Promise<Buffer> {
    try {
      const encryptCommand = new EncryptCommand({
        KeyId: this.kmsKeyId,
        Plaintext: file,
      });

      const result = await kmsClient().send(encryptCommand);
      
      if (!result.CiphertextBlob) {
        throw new Error('Encryption failed');
      }

      return Buffer.from(result.CiphertextBlob);
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw new AppError('Failed to encrypt file', 500);
    }
  }

  /**
   * Decrypt file content using KMS
   */
  private async decryptFile(encryptedFile: Buffer): Promise<Buffer> {
    try {
      const decryptCommand = new DecryptCommand({
        CiphertextBlob: encryptedFile,
      });

      const result = await kmsClient().send(decryptCommand);
      
      if (!result.Plaintext) {
        throw new Error('Decryption failed');
      }

      return Buffer.from(result.Plaintext);
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw new AppError('Failed to decrypt file', 500);
    }
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private async calculateChecksum(file: Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(file).digest('hex');
  }

  /**
   * Generate secure download URL for document (admin only)
   */
  async generateDownloadUrl(
    documentId: string,
    userId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const s3Key = `${this.documentPrefix}/${userId}/${documentId}`;
      
      // In a real implementation, this would use presigned URLs
      // For now, return a placeholder
      return `https://${this.bucketName}.s3.amazonaws.com/${s3Key}?expires=${expiresIn}`;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new AppError('Failed to generate download URL', 500);
    }
  }

  /**
   * Get all KYC applications for admin review
   */
  async getKYCApplicationsForReview(
    status?: KYCApplication['status'],
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    applications: KYCApplication[];
    total: number;
  }> {
    // In a real implementation, this would query the database
    // For now, return empty results
    return {
      applications: [],
      total: 0,
    };
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _kycService: KYCService;

export const kycService = () => {
  if (!_kycService) {
    _kycService = new KYCService();
  }
  return _kycService;
};
