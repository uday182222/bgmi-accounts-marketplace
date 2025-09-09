import { Request, Response } from 'express';
import { credentialEncryptionService } from '../services/credentialEncryptionService';
import { authenticateCognito } from '../middleware/cognitoAuth';

interface CredentialSubmissionRequest {
  listingId: string;
  loginMethod: 'facebook' | 'twitter';
  loginId: string;
  password: string;
  additionalInstructions?: string;
}

interface CredentialRetrievalRequest {
  listingId: string;
  accessToken: string;
}

export class CredentialController {
  /**
   * Submit credentials for a listing (seller only)
   */
  public async submitCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { listingId, loginMethod, loginId, password, additionalInstructions } = req.body as CredentialSubmissionRequest;
      const sellerId = req.user?.id; // From Cognito auth

      if (!sellerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate required fields
      if (!listingId || !loginMethod || !loginId || !password) {
        res.status(400).json({ 
          error: 'Missing required fields',
          required: ['listingId', 'loginMethod', 'loginId', 'password']
        });
        return;
      }

      // Validate login method
      if (!['facebook', 'twitter'].includes(loginMethod)) {
        res.status(400).json({ 
          error: 'Invalid login method',
          allowed: ['facebook', 'twitter']
        });
        return;
      }

      // TODO: Verify that the listing belongs to the seller and is in approved status
      // const listing = await bgmiListingService.getListingById(listingId);
      // if (!listing || listing.sellerId !== sellerId || listing.status !== 'approved') {
      //   res.status(403).json({ error: 'Listing not found or not approved' });
      //   return;
      // }

      const credentials = {
        loginMethod,
        loginId,
        password,
        additionalInstructions
      };

      // Create secure storage
      const secureStorage = credentialEncryptionService.createSecureStorage(
        credentials,
        listingId,
        sellerId
      );

      // TODO: Save to database
      // await credentialService.saveCredentials(secureStorage);

      // Update listing status to credentials_submitted
      // await bgmiListingService.updateListingStatus(listingId, 'credentials_submitted');

      res.status(201).json({
        message: 'Credentials submitted successfully',
        listingId,
        accessToken: secureStorage.accessToken,
        submittedAt: secureStorage.createdAt
      });

    } catch (error) {
      console.error('Error submitting credentials:', error);
      res.status(500).json({ error: 'Failed to submit credentials' });
    }
  }

  /**
   * Retrieve credentials for admin testing (admin only)
   */
  public async retrieveCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { listingId } = req.params;
      const adminId = req.user?.id; // From Cognito auth

      if (!adminId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // TODO: Verify admin role
      // if (!req.user?.isAdmin) {
      //   res.status(403).json({ error: 'Admin access required' });
      //   return;
      // }

      // TODO: Get secure storage from database
      // const secureStorage = await credentialService.getCredentials(listingId);
      // if (!secureStorage) {
      //   res.status(404).json({ error: 'Credentials not found' });
      //   return;
      // }

      // Mock secure storage for now
      const mockSecureStorage = {
        listingId,
        sellerId: 'mock-seller-id',
        encryptedCredentials: {
          encryptedData: 'mock-encrypted-data',
          iv: 'mock-iv',
          tag: 'mock-tag'
        },
        credentialHash: 'mock-hash',
        accessToken: 'mock-access-token',
        createdAt: new Date().toISOString(),
        lastAccessed: null,
        accessCount: 0,
        isActive: true
      };

      // Retrieve and decrypt credentials
      const credentials = credentialEncryptionService.retrieveCredentials(
        mockSecureStorage,
        adminId
      );

      // Return credentials (in production, this should be logged and monitored)
      res.json({
        listingId,
        credentials: {
          loginMethod: credentials.loginMethod,
          loginId: credentials.loginId,
          // Don't return password in response for security
          hasPassword: !!credentials.password,
          additionalInstructions: credentials.additionalInstructions
        },
        retrievedAt: new Date().toISOString(),
        retrievedBy: adminId
      });

    } catch (error) {
      console.error('Error retrieving credentials:', error);
      res.status(500).json({ error: 'Failed to retrieve credentials' });
    }
  }

  /**
   * Test credentials (admin only)
   */
  public async testCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { listingId } = req.params;
      const { testLoginId, testPassword } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // TODO: Get secure storage from database
      const mockSecureStorage = {
        listingId,
        encryptedCredentials: {
          encryptedData: 'mock-encrypted-data',
          iv: 'mock-iv',
          tag: 'mock-tag'
        },
        isActive: true
      };

      // Verify credentials
      const isValid = credentialEncryptionService.verifyCredentials(
        mockSecureStorage.encryptedCredentials,
        {
          loginId: testLoginId,
          password: testPassword
        }
      );

      res.json({
        listingId,
        isValid,
        testedAt: new Date().toISOString(),
        testedBy: adminId
      });

    } catch (error) {
      console.error('Error testing credentials:', error);
      res.status(500).json({ error: 'Failed to test credentials' });
    }
  }

  /**
   * Deactivate credentials after safe period (admin only)
   */
  public async deactivateCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { listingId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // TODO: Get secure storage from database
      const mockSecureStorage = {
        listingId,
        isActive: true
      };

      // Deactivate credentials
      credentialEncryptionService.deactivateCredentials(mockSecureStorage, adminId);

      res.json({
        message: 'Credentials deactivated successfully',
        listingId,
        deactivatedAt: new Date().toISOString(),
        deactivatedBy: adminId
      });

    } catch (error) {
      console.error('Error deactivating credentials:', error);
      res.status(500).json({ error: 'Failed to deactivate credentials' });
    }
  }

  /**
   * Get credential access logs (admin only)
   */
  public async getAccessLogs(req: Request, res: Response): Promise<void> {
    try {
      const { listingId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // TODO: Get access logs from database
      const mockLogs = [
        {
          timestamp: new Date().toISOString(),
          listingId,
          action: 'encrypt',
          adminId: null,
          ip: '127.0.0.1',
          userAgent: 'BGMI-Seller-Portal'
        },
        {
          timestamp: new Date().toISOString(),
          listingId,
          action: 'decrypt',
          adminId,
          ip: '127.0.0.1',
          userAgent: 'BGMI-Admin-Portal'
        }
      ];

      res.json({
        listingId,
        logs: mockLogs,
        totalAccess: mockLogs.length
      });

    } catch (error) {
      console.error('Error getting access logs:', error);
      res.status(500).json({ error: 'Failed to get access logs' });
    }
  }
}

export const credentialController = new CredentialController();
