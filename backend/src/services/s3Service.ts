import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_CONFIG, s3Client } from '../config/aws';

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = AWS_CONFIG.s3BucketName;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; key: string; url?: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
        // Make object publicly readable if needed
        ACL: 'public-read'
      });

      await s3Client().send(command);
      
      // Generate pre-signed URL for immediate access
      const url = await this.getSignedUrl(key);
      
      return {
        success: true,
        key,
        url
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Get pre-signed URL for file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(s3Client(), command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Get public URL (if bucket is public)
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client().send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await s3Client().send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Array<{
      file: Buffer;
      key: string;
      contentType: string;
      metadata?: Record<string, string>;
    }>
  ): Promise<Array<{ success: boolean; key: string; url?: string; error?: string }>> {
    const results = await Promise.allSettled(
      files.map(fileData => this.uploadFile(
        fileData.file,
        fileData.key,
        fileData.contentType,
        fileData.metadata
      ))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          key: files[index]?.key || 'unknown',
          error: result.reason?.message || 'Unknown error'
        };
      }
    });
  }

  /**
   * Upload multiple images (alias for uploadMultipleFiles)
   */
  async uploadMultipleImages(
    files: Array<{
      file: Buffer;
      key: string;
      contentType: string;
      metadata?: Record<string, string>;
    }>
  ): Promise<Array<{ success: boolean; key: string; url?: string; error?: string }>> {
    return this.uploadMultipleFiles(files);
  }

  /**
   * Generate folder structure for organized storage
   */
  generateKey(folder: string, filename: string, userId?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    if (userId) {
      return `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedFilename}`;
    }
    
    return `${folder}/${timestamp}_${randomString}_${sanitizedFilename}`;
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _s3Service: S3Service;

export const s3Service = () => {
  if (!_s3Service) {
    _s3Service = new S3Service();
  }
  return _s3Service;
};