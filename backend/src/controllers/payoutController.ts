import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { payoutService } from '../services/payoutService';

/**
 * Add a payout method for the current user
 */
export const addPayoutMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, details } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!type || !['bank_account', 'paypal', 'stripe_connect'].includes(type)) {
      throw new AppError('Invalid payout method type', 400);
    }

    // Validate details based on type
    if (type === 'bank_account') {
      const requiredFields = ['bankName', 'accountNumber', 'routingNumber', 'accountHolderName'];
      for (const field of requiredFields) {
        if (!details[field]) {
          throw new AppError(`Missing required field: ${field}`, 400);
        }
      }
    } else if (type === 'paypal') {
      if (!details.paypalEmail) {
        throw new AppError('PayPal email is required', 400);
      }
    }

    const payoutMethod = await payoutService.instance.addPayoutMethod(userId, type, details);

    res.status(201).json({
      success: true,
      message: 'Payout method added successfully',
      data: {
        payoutMethod: {
          id: payoutMethod.id,
          type: payoutMethod.type,
          isDefault: payoutMethod.isDefault,
          status: payoutMethod.status,
          createdAt: payoutMethod.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout methods for the current user
 */
export const getPayoutMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const payoutMethods = await payoutService.instance.getPayoutMethods(userId);

    res.json({
      success: true,
      data: {
        payoutMethods: payoutMethods.map(method => ({
          id: method.id,
          type: method.type,
          isDefault: method.isDefault,
          status: method.status,
          details: {
            // Only return safe details, not sensitive information
            bankName: method.details.bankName,
            accountHolderName: method.details.accountHolderName,
            paypalEmail: method.details.paypalEmail,
            stripeAccountStatus: method.details.stripeAccountStatus,
          },
          createdAt: method.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set default payout method
 */
export const setDefaultPayoutMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { payoutMethodId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!payoutMethodId) {
      throw new AppError('Missing required parameter: payoutMethodId', 400);
    }

    await payoutService.instance.setDefaultPayoutMethod(userId, payoutMethodId);

    res.json({
      success: true,
      message: 'Default payout method updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a payout method
 */
export const removePayoutMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { payoutMethodId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!payoutMethodId) {
      throw new AppError('Missing required parameter: payoutMethodId', 400);
    }

    await payoutService.instance.removePayoutMethod(userId, payoutMethodId);

    res.json({
      success: true,
      message: 'Payout method removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a payout for a verified account
 */
export const createPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { accountId, accountValue, accountTitle } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!accountId || !accountValue || !accountTitle) {
      throw new AppError('Missing required fields: accountId, accountValue, accountTitle', 400);
    }

    if (typeof accountValue !== 'number' || accountValue <= 0) {
      throw new AppError('Account value must be a positive number', 400);
    }

    const payout = await payoutService.instance.createPayout(userId, accountId, accountValue, accountTitle);

    res.status(201).json({
      success: true,
      message: 'Payout created successfully',
      data: {
        payout: {
          id: payout.id,
          accountId: payout.accountId,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          createdAt: payout.createdAt,
          metadata: {
            accountTitle: payout.metadata.accountTitle,
            platformCommission: payout.metadata.platformCommission,
            netAmount: payout.metadata.netAmount,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout history for the current user
 */
export const getPayoutHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const result = await payoutService.instance.getPayoutHistory(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: {
        payouts: result.payouts.map(payout => ({
          id: payout.id,
          accountId: payout.accountId,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          processedAt: payout.processedAt,
          createdAt: payout.createdAt,
          metadata: {
            accountTitle: payout.metadata.accountTitle,
            platformCommission: payout.metadata.platformCommission,
            netAmount: payout.metadata.netAmount,
          },
        })),
        total: result.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout summary for the current user
 */
export const getPayoutSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const summary = await payoutService.instance.getPayoutSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout by ID
 */
export const getPayoutById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { payoutId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!payoutId) {
      throw new AppError('Missing required parameter: payoutId', 400);
    }

    const payout = await payoutService.instance.getPayoutById(payoutId, userId);

    if (!payout) {
      throw new AppError('Payout not found', 404);
    }

    res.json({
      success: true,
      data: {
        payout: {
          id: payout.id,
          accountId: payout.accountId,
          amount: payout.amount,
          currency: payout.currency,
          status: payout.status,
          payoutMethodId: payout.payoutMethodId,
          stripeTransferId: payout.stripeTransferId,
          failureReason: payout.failureReason,
          processedAt: payout.processedAt,
          createdAt: payout.createdAt,
          updatedAt: payout.updatedAt,
          metadata: payout.metadata,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a pending payout
 */
export const cancelPayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { payoutId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!payoutId) {
      throw new AppError('Missing required parameter: payoutId', 400);
    }

    await payoutService.instance.cancelPayout(payoutId, userId);

    res.json({
      success: true,
      message: 'Payout cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout settings and limits
 */
export const getPayoutSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const commissionRate = payoutService.instance.getCommissionRate();
    const minimumPayoutAmount = payoutService.instance.getMinimumPayoutAmount();

    res.json({
      success: true,
      data: {
        commissionRate,
        minimumPayoutAmount,
        supportedMethods: ['bank_account', 'paypal', 'stripe_connect'],
        processingTime: {
          bank_account: '3-5 business days',
          paypal: '1-2 business days',
          stripe_connect: '1-2 business days',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Stripe webhook for payout status updates
 */
export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new AppError('Stripe webhook secret not configured', 500);
    }

    // Verify webhook signature
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new AppError('Invalid webhook signature', 400);
    }

    // Handle the event
    await payoutService.instance.handleStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
