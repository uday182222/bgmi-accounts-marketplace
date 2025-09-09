import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { safeTransferService } from '../services/safeTransferService';

/**
 * Create a new safe transfer period
 */
export const createSafeTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { accountId, buyerId, sellerId, transactionId, encryptedCredentials, dataKey, duration } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!accountId || !buyerId || !sellerId || !transactionId || !encryptedCredentials || !dataKey) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user is authorized to create this transfer
    if (userId !== buyerId && userId !== sellerId) {
      throw new AppError('Unauthorized to create this transfer', 403);
    }

    const transfer = await safeTransferService().createSafeTransfer(
      accountId,
      buyerId,
      sellerId,
      transactionId,
      encryptedCredentials,
      dataKey,
      duration
    );

    res.status(201).json({
      success: true,
      message: 'Safe transfer period created successfully',
      data: {
        transfer: {
          id: transfer.id,
          accountId: transfer.accountId,
          buyerId: transfer.buyerId,
          sellerId: transfer.sellerId,
          transactionId: transfer.transactionId,
          status: transfer.status,
          startTime: transfer.startTime,
          endTime: transfer.endTime,
          duration: transfer.duration,
          suspiciousActivity: {
            detected: transfer.suspiciousActivity.detected,
            count: transfer.suspiciousActivity.count,
            lastDetected: transfer.suspiciousActivity.lastDetected,
          },
          createdAt: transfer.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transfer by ID
 */
export const getTransferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!transferId) {
      throw new AppError('Missing required parameter: transferId', 400);
    }

    const transfer = await safeTransferService().getTransferById(transferId, userId);

    if (!transfer) {
      throw new AppError('Transfer not found or access denied', 404);
    }

    res.json({
      success: true,
      data: {
        transfer: {
          id: transfer.id,
          accountId: transfer.accountId,
          buyerId: transfer.buyerId,
          sellerId: transfer.sellerId,
          transactionId: transfer.transactionId,
          status: transfer.status,
          startTime: transfer.startTime,
          endTime: transfer.endTime,
          duration: transfer.duration,
          lastCheckTime: transfer.lastCheckTime,
          nextCheckTime: transfer.nextCheckTime,
          checksPerformed: transfer.checksPerformed,
          suspiciousActivity: transfer.suspiciousActivity,
          credentials: {
            releasedAt: transfer.credentials.releasedAt,
            releaseMethod: transfer.credentials.releaseMethod,
          },
          createdAt: transfer.createdAt,
          updatedAt: transfer.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transfers for current user
 */
export const getTransfersForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const transfers = await safeTransferService().getTransfersForUser(
      userId,
      status as any
    );

    res.json({
      success: true,
      data: {
        transfers: transfers.map(transfer => ({
          id: transfer.id,
          accountId: transfer.accountId,
          buyerId: transfer.buyerId,
          sellerId: transfer.sellerId,
          transactionId: transfer.transactionId,
          status: transfer.status,
          startTime: transfer.startTime,
          endTime: transfer.endTime,
          duration: transfer.duration,
          suspiciousActivity: {
            detected: transfer.suspiciousActivity.detected,
            count: transfer.suspiciousActivity.count,
            lastDetected: transfer.suspiciousActivity.lastDetected,
          },
          createdAt: transfer.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transfer checks
 */
export const getTransferChecks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!transferId) {
      throw new AppError('Missing required parameter: transferId', 400);
    }

    const checks = await safeTransferService().getTransferChecks(transferId, userId);

    res.json({
      success: true,
      data: {
        checks: checks.map(check => ({
          id: check.id,
          checkTime: check.checkTime,
          status: check.status,
          details: check.details,
          createdAt: check.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transfer alerts
 */
export const getTransferAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!transferId) {
      throw new AppError('Missing required parameter: transferId', 400);
    }

    const alerts = await safeTransferService().getTransferAlerts(transferId, userId);

    res.json({
      success: true,
      data: {
        alerts: alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          details: alert.details,
          acknowledged: alert.acknowledged,
          acknowledgedBy: alert.acknowledgedBy,
          acknowledgedAt: alert.acknowledgedAt,
          createdAt: alert.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId, alertId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!transferId || !alertId) {
      throw new AppError('Missing required parameters: transferId, alertId', 400);
    }

    await safeTransferService().acknowledgeAlert(transferId, alertId, userId);

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active transfers (admin only)
 */
export const getAllActiveTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const transfers = await safeTransferService().getAllActiveTransfers();

    res.json({
      success: true,
      data: {
        transfers: transfers.map(transfer => ({
          id: transfer.id,
          accountId: transfer.accountId,
          buyerId: transfer.buyerId,
          sellerId: transfer.sellerId,
          transactionId: transfer.transactionId,
          status: transfer.status,
          startTime: transfer.startTime,
          endTime: transfer.endTime,
          duration: transfer.duration,
          lastCheckTime: transfer.lastCheckTime,
          nextCheckTime: transfer.nextCheckTime,
          checksPerformed: transfer.checksPerformed,
          suspiciousActivity: transfer.suspiciousActivity,
          createdAt: transfer.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transfer statistics (admin only)
 */
export const getTransferStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    const statistics = await safeTransferService().getTransferStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a transfer early (admin only)
 */
export const completeTransferEarly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId } = req.params;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (!transferId) {
      throw new AppError('Missing required parameter: transferId', 400);
    }

    const transfer = await safeTransferService().completeTransfer(transferId);

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transfer: {
          id: transfer.id,
          status: transfer.status,
          completedAt: transfer.credentials.releasedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fail a transfer (admin only)
 */
export const failTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transferId } = req.params;
    const { reason } = req.body;

    if (!userId || req.user?.role !== 'admin') {
      throw new AppError('Admin access required', 403);
    }

    if (!transferId) {
      throw new AppError('Missing required parameter: transferId', 400);
    }

    if (!reason) {
      throw new AppError('Failure reason is required', 400);
    }

    const transfer = await safeTransferService().failTransfer(transferId, reason);

    res.json({
      success: true,
      message: 'Transfer failed successfully',
      data: {
        transfer: {
          id: transfer.id,
          status: transfer.status,
          failedAt: transfer.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
