import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { kycService } from '../services/kycService';
import multer from 'multer';

// Configure multer for KYC document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only images and PDFs are allowed.', 400));
    }
  },
});

/**
 * Upload KYC document
 */
export const uploadKYCDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type } = req.body;
    const file = req.file;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!file) {
      throw new AppError('No file provided', 400);
    }

    if (!type || !['id_front', 'id_back', 'selfie', 'proof_of_address'].includes(type)) {
      throw new AppError('Invalid document type', 400);
    }

    const document = await kycService().uploadDocument(
      userId,
      type as any,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          id: document.id,
          type: document.type,
          fileName: document.fileName,
          status: document.status,
          uploadedAt: document.uploadedAt,
          metadata: {
            fileSize: document.metadata.fileSize,
            mimeType: document.metadata.mimeType,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit KYC application
 */
export const submitKYCApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { personalInfo, documents } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate personal information
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!personalInfo[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    // Create KYC application
    const application = await kycService().createKYCApplication(userId, personalInfo);

    // Submit application with documents
    const submittedApplication = await kycService().submitKYCApplication(application.id, documents);

    res.status(201).json({
      success: true,
      message: 'KYC application submitted successfully',
      data: {
        application: {
          id: submittedApplication.id,
          status: submittedApplication.status,
          submittedAt: submittedApplication.submittedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC status for current user
 */
export const getKYCStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const kycStatus = await kycService().getKYCStatus(userId);

    res.json({
      success: true,
      data: kycStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC document (admin only)
 */
export const getKYCDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { documentId, userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!documentId || !userId) {
      throw new AppError('Missing required parameters', 400);
    }

    // Check if user is admin or document owner
    if (req.user?.role !== 'admin' && currentUserId !== userId) {
      throw new AppError('Unauthorized access to document', 403);
    }

    const { file, mimeType } = await kycService().getDocument(documentId, userId);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="document-${documentId}"`);
    res.send(file);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { documentId, userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!documentId || !userId) {
      throw new AppError('Missing required parameters', 400);
    }

    // Check if user is admin or document owner
    if (req.user?.role !== 'admin' && currentUserId !== userId) {
      throw new AppError('Unauthorized access to document', 403);
    }

    await kycService().deleteDocument(documentId, userId);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all KYC applications for admin review
 */
export const getKYCApplicationsForReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const { status, limit = 50, offset = 0 } = req.query;

    const result = await kycService().getKYCApplicationsForReview(
      status as any,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review KYC application (admin only)
 */
export const reviewKYCApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { applicationId } = req.params;
    const { decision, rejectionReason } = req.body;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (!applicationId) {
      throw new AppError('Missing required parameter: applicationId', 400);
    }

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      throw new AppError('Invalid decision. Must be "approved" or "rejected"', 400);
    }

    if (decision === 'rejected' && !rejectionReason) {
      throw new AppError('Rejection reason is required when rejecting application', 400);
    }

    const application = await kycService().reviewKYCApplication(
      applicationId,
      decision,
      userId,
      rejectionReason
    );

    res.json({
      success: true,
      message: `KYC application ${decision} successfully`,
      data: {
        application: {
          id: application.id,
          status: application.status,
          reviewedAt: application.reviewedAt,
          reviewedBy: application.reviewedBy,
          rejectionReason: application.rejectionReason,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate download URL for KYC document (admin only)
 */
export const generateDocumentDownloadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { documentId, targetUserId } = req.params;
    const { expiresIn = 3600 } = req.body;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (!documentId || !targetUserId) {
      throw new AppError('Missing required parameters: documentId, targetUserId', 400);
    }

    const downloadUrl = await kycService().generateDownloadUrl(
      documentId,
      targetUserId,
      parseInt(expiresIn)
    );

    res.json({
      success: true,
      data: {
        downloadUrl,
        expiresIn: parseInt(expiresIn),
      },
    });
  } catch (error) {
    next(error);
  }
};

export { upload };
