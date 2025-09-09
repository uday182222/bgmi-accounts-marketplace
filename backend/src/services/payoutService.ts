import { Stripe } from 'stripe';
import { AppError } from '../middleware/errorHandler';
import { AWS_CONFIG } from '../config/aws';

export interface PayoutMethod {
  id: string;
  userId: string;
  type: 'bank_account' | 'paypal' | 'stripe_connect';
  isDefault: boolean;
  status: 'active' | 'pending' | 'failed' | 'deactivated';
  details: {
    // Bank account details
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    
    // PayPal details
    paypalEmail?: string;
    
    // Stripe Connect details
    stripeAccountId?: string;
    stripeAccountStatus?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Payout {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutMethodId: string;
  stripeTransferId?: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    accountTitle: string;
    platformCommission: number;
    netAmount: number;
    transactionId?: string;
  };
}

export interface PayoutSummary {
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
  nextPayoutDate?: Date;
  lastPayoutDate?: Date;
  availableBalance: number;
}

class PayoutService {
  private stripe: Stripe;
  private readonly platformCommissionRate = 0.15; // 15% platform commission
  private readonly minimumPayoutAmount = 25.00; // $25 minimum payout

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for payout service');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Add a payout method for a user
   */
  async addPayoutMethod(
    userId: string,
    type: PayoutMethod['type'],
    details: PayoutMethod['details']
  ): Promise<PayoutMethod> {
    try {
      let stripeAccountId: string | undefined;

      // Create Stripe Connect account if needed
      if (type === 'stripe_connect') {
        const account = await this.stripe.accounts.create({
          type: 'express',
          country: 'US', // This should come from user's country
          email: details.paypalEmail, // Use email as fallback
        });

        stripeAccountId = account.id;
        details.stripeAccountId = account.id;
        details.stripeAccountStatus = account.details_submitted ? 'active' : 'pending';
      }

      const payoutMethod: PayoutMethod = {
        id: `pm_${userId}_${Date.now()}`,
        userId,
        type,
        isDefault: false, // Will be set to true if it's the first method
        status: type === 'stripe_connect' ? 'pending' : 'active',
        details,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In a real implementation, this would be stored in the database
      // For now, we'll return the payout method object

      return payoutMethod;
    } catch (error) {
      console.error('Error adding payout method:', error);
      throw new AppError('Failed to add payout method', 500);
    }
  }

  /**
   * Get payout methods for a user
   */
  async getPayoutMethods(userId: string): Promise<PayoutMethod[]> {
    try {
      // In a real implementation, this would query the database
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting payout methods:', error);
      throw new AppError('Failed to get payout methods', 500);
    }
  }

  /**
   * Set default payout method
   */
  async setDefaultPayoutMethod(userId: string, payoutMethodId: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      // Set all methods to non-default, then set the specified one as default
    } catch (error) {
      console.error('Error setting default payout method:', error);
      throw new AppError('Failed to set default payout method', 500);
    }
  }

  /**
   * Remove a payout method
   */
  async removePayoutMethod(userId: string, payoutMethodId: string): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Check if it's the default method
      // 2. If so, set another method as default
      // 3. Delete the payout method
      // 4. If it's a Stripe Connect account, deactivate it
    } catch (error) {
      console.error('Error removing payout method:', error);
      throw new AppError('Failed to remove payout method', 500);
    }
  }

  /**
   * Create a payout for a verified account
   */
  async createPayout(
    userId: string,
    accountId: string,
    accountValue: number,
    accountTitle: string
  ): Promise<Payout> {
    try {
      // Calculate payout amounts
      const platformCommission = accountValue * this.platformCommissionRate;
      const netAmount = accountValue - platformCommission;

      // Check if user has a payout method
      const payoutMethods = await this.getPayoutMethods(userId);
      const defaultMethod = payoutMethods.find(method => method.isDefault && method.status === 'active');

      if (!defaultMethod) {
        throw new AppError('No active payout method found. Please add a payout method first.', 400);
      }

      // Check minimum payout amount
      if (netAmount < this.minimumPayoutAmount) {
        throw new AppError(`Minimum payout amount is $${this.minimumPayoutAmount}`, 400);
      }

      const payout: Payout = {
        id: `payout_${userId}_${Date.now()}`,
        userId,
        accountId,
        amount: netAmount,
        currency: 'usd',
        status: 'pending',
        payoutMethodId: defaultMethod.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          accountTitle,
          platformCommission,
          netAmount,
        },
      };

      // Process payout based on method type
      if (defaultMethod.type === 'stripe_connect' && defaultMethod.details.stripeAccountId) {
        await this.processStripePayout(payout, defaultMethod.details.stripeAccountId);
      } else if (defaultMethod.type === 'bank_account') {
        await this.processBankPayout(payout, defaultMethod.details);
      } else if (defaultMethod.type === 'paypal') {
        await this.processPayPalPayout(payout, defaultMethod.details);
      }

      return payout;
    } catch (error) {
      console.error('Error creating payout:', error);
      throw new AppError('Failed to create payout', 500);
    }
  }

  /**
   * Process payout via Stripe Connect
   */
  private async processStripePayout(payout: Payout, stripeAccountId: string): Promise<void> {
    try {
      // Create transfer to connected account
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(payout.amount * 100), // Convert to cents
        currency: payout.currency,
        destination: stripeAccountId,
        metadata: {
          payoutId: payout.id,
          accountId: payout.accountId,
        },
      });

      // Update payout with Stripe transfer ID
      payout.stripeTransferId = transfer.id;
      payout.status = 'processing';

      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error processing Stripe payout:', error);
      payout.status = 'failed';
      payout.failureReason = 'Stripe transfer failed';
      throw error;
    }
  }

  /**
   * Process payout via bank account
   */
  private async processBankPayout(payout: Payout, details: PayoutMethod['details']): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Create a bank transfer via Stripe or another payment processor
      // 2. Handle ACH transfers or wire transfers
      // 3. Update payout status based on transfer result

      // For now, simulate processing
      payout.status = 'processing';
      
      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error processing bank payout:', error);
      payout.status = 'failed';
      payout.failureReason = 'Bank transfer failed';
      throw error;
    }
  }

  /**
   * Process payout via PayPal
   */
  private async processPayPalPayout(payout: Payout, details: PayoutMethod['details']): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Use PayPal API to send money
      // 2. Handle PayPal webhooks for status updates
      // 3. Update payout status based on PayPal response

      // For now, simulate processing
      payout.status = 'processing';
      
      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error processing PayPal payout:', error);
      payout.status = 'failed';
      payout.failureReason = 'PayPal transfer failed';
      throw error;
    }
  }

  /**
   * Get payout history for a user
   */
  async getPayoutHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    payouts: Payout[];
    total: number;
  }> {
    try {
      // In a real implementation, this would query the database
      // For now, return empty results
      return {
        payouts: [],
        total: 0,
      };
    } catch (error) {
      console.error('Error getting payout history:', error);
      throw new AppError('Failed to get payout history', 500);
    }
  }

  /**
   * Get payout summary for a user
   */
  async getPayoutSummary(userId: string): Promise<PayoutSummary> {
    try {
      // In a real implementation, this would calculate from database
      // For now, return mock data
      return {
        totalEarnings: 0,
        totalPayouts: 0,
        pendingPayouts: 0,
        availableBalance: 0,
      };
    } catch (error) {
      console.error('Error getting payout summary:', error);
      throw new AppError('Failed to get payout summary', 500);
    }
  }

  /**
   * Get payout by ID
   */
  async getPayoutById(payoutId: string, userId: string): Promise<Payout | null> {
    try {
      // In a real implementation, this would query the database
      // For now, return null
      return null;
    } catch (error) {
      console.error('Error getting payout by ID:', error);
      throw new AppError('Failed to get payout', 500);
    }
  }

  /**
   * Cancel a pending payout
   */
  async cancelPayout(payoutId: string, userId: string): Promise<void> {
    try {
      const payout = await this.getPayoutById(payoutId, userId);
      
      if (!payout) {
        throw new AppError('Payout not found', 404);
      }

      if (payout.status !== 'pending') {
        throw new AppError('Only pending payouts can be cancelled', 400);
      }

      // Cancel the payout
      payout.status = 'cancelled';
      payout.updatedAt = new Date();

      // In a real implementation, this would update the database
    } catch (error) {
      console.error('Error cancelling payout:', error);
      throw new AppError('Failed to cancel payout', 500);
    }
  }

  /**
   * Handle Stripe webhook for payout status updates
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'transfer.created':
          // Handle transfer creation
          break;
        case 'transfer.updated':
          // Handle transfer status updates
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  /**
   * Get platform commission rate
   */
  getCommissionRate(): number {
    return this.platformCommissionRate;
  }

  /**
   * Get minimum payout amount
   */
  getMinimumPayoutAmount(): number {
    return this.minimumPayoutAmount;
  }
}

// Lazy initialization to ensure environment variables are loaded
let _payoutService: PayoutService | null = null;

export const payoutService = {
  get instance() {
    if (!_payoutService) {
      _payoutService = new PayoutService();
    }
    return _payoutService;
  }
};
