import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { stripeService } from '../services/stripeService';
import { kmsService } from '../services/kmsService';

// Mock transaction data - in real app, this would come from database
const transactions: any[] = [];

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { accountId, amount, currency = 'usd' } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!accountId || !amount) {
      throw new AppError('Account ID and amount are required', 400);
    }

    // TODO: Validate account exists and is available for purchase
    // TODO: Check if user already has a pending payment for this account

    // Create payment intent
    const paymentIntent = await stripeService.instance.createPaymentIntent(
      amount,
      currency,
      {
        userId,
        accountId,
        type: 'account_purchase'
      }
    );

    // Create transaction record
    const transaction = {
      id: paymentIntent.id,
      userId,
      accountId,
      amount,
      currency,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    transactions.push(transaction);

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency
      }
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { paymentIntentId } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!paymentIntentId) {
      throw new AppError('Payment intent ID is required', 400);
    }

    // Find transaction
    const transaction = transactions.find(t => t.paymentIntentId === paymentIntentId && t.userId === userId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Confirm payment with Stripe
    const paymentIntent = await stripeService.instance.confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update transaction status
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.updatedAt = new Date();

      // TODO: Transfer account ownership
      // TODO: Send credentials to buyer
      // TODO: Notify seller of successful sale
      // TODO: Calculate and process platform fees

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          transactionId: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency
        }
      });
    } else {
      throw new AppError('Payment not completed', 400);
    }
  } catch (error) {
    next(error);
  }
};

export const createRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transactionId, reason = 'requested_by_customer' } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!transactionId) {
      throw new AppError('Transaction ID is required', 400);
    }

    // Find transaction
    const transaction = transactions.find(t => t.id === transactionId && t.userId === userId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status !== 'completed') {
      throw new AppError('Can only refund completed transactions', 400);
    }

    // Create refund with Stripe
    const refund = await stripeService.instance.createRefund(
      transaction.paymentIntentId,
      undefined, // Full refund
      reason as any
    );

    // Update transaction status
    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    transaction.refundId = refund.id;
    transaction.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    let userTransactions = transactions.filter(t => t.userId === userId);

    // Filter by status if provided
    if (status) {
      userTransactions = userTransactions.filter(t => t.status === status);
    }

    // Sort by creation date (newest first)
    userTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    const paginatedTransactions = userTransactions.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: userTransactions.length,
          pages: Math.ceil(userTransactions.length / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const transaction = transactions.find(t => t.id === transactionId && t.userId === userId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { email, name } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Check if customer already exists
    const existingCustomer = transactions.find(t => t.userId === userId && t.customerId);
    if (existingCustomer) {
      const customer = await stripeService.instance.getCustomer(existingCustomer.customerId);
      res.json({
        success: true,
        data: { customer }
      });
    }

    // Create new customer
    const customer = await stripeService.instance.createCustomer(email, name, {
      userId,
      platform: 'bgmi-accounts'
    });

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { customerId } = req.params;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!customerId) {
      throw new AppError('Customer ID is required', 400);
    }

    const paymentMethods = await stripeService.instance.getPaymentMethods(customerId);

    res.json({
      success: true,
      data: { paymentMethods }
    });
  } catch (error) {
    next(error);
  }
};

export const createSetupIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { customerId } = req.body;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!customerId) {
      throw new AppError('Customer ID is required', 400);
    }

    const setupIntent = await stripeService.instance.createSetupIntent(customerId, {
      userId,
      type: 'payment_method_setup'
    });

    res.json({
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError('Webhook secret not configured', 500);
    }

    // Construct webhook event
    const event = await stripeService.instance.constructWebhookEvent(
      req.body,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as any);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as any);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

async function handlePaymentSucceeded(paymentIntent: any): Promise<void> {
  console.log('Payment succeeded:', paymentIntent.id);
  // TODO: Update transaction status
  // TODO: Transfer account ownership
  // TODO: Send credentials to buyer
  // TODO: Notify seller
}

async function handlePaymentFailed(paymentIntent: any): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);
  // TODO: Update transaction status
  // TODO: Notify user of payment failure
}

async function handleDisputeCreated(dispute: any): Promise<void> {
  console.log('Dispute created:', dispute.id);
  // TODO: Handle dispute
  // TODO: Notify admin
  // TODO: Freeze account if necessary
}