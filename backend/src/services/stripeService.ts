import Stripe from 'stripe';
import { AWS_CONFIG } from '../config/aws';
import { AppError } from '../middleware/errorHandler';

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new AppError(
        `Failed to create payment intent: ${error.message}`,
        500
      );
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return paymentIntent;
      }

      throw new AppError('Payment not completed', 400);
    } catch (error: any) {
      console.error('Error confirming payment intent:', error);
      throw new AppError(
        `Failed to confirm payment: ${error.message}`,
        500
      );
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason: Stripe.RefundCreateParams.Reason = 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      });

      return refund;
    } catch (error: any) {
      console.error('Error creating refund:', error);
      throw new AppError(
        `Failed to create refund: ${error.message}`,
        500
      );
    }
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new AppError(
        `Failed to create customer: ${error.message}`,
        500
      );
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer;
    } catch (error: any) {
      console.error('Error retrieving customer:', error);
      throw new AppError(
        `Failed to retrieve customer: ${error.message}`,
        500
      );
    }
  }

  async createSetupIntent(
    customerId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        metadata,
      });

      return setupIntent;
    } catch (error: any) {
      console.error('Error creating setup intent:', error);
      throw new AppError(
        `Failed to create setup intent: ${error.message}`,
        500
      );
    }
  }

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error: any) {
      console.error('Error retrieving payment methods:', error);
      throw new AppError(
        `Failed to retrieve payment methods: ${error.message}`,
        500
      );
    }
  }

  async createTransfer(
    amount: number,
    destination: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination,
        metadata,
      });

      return transfer;
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      throw new AppError(
        `Failed to create transfer: ${error.message}`,
        500
      );
    }
  }

  async createWebhookEndpoint(
    url: string,
    events: string[]
  ): Promise<Stripe.WebhookEndpoint> {
    try {
      const webhook = await this.stripe.webhookEndpoints.create({
        url,
        enabled_events: events as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      });

      return webhook;
    } catch (error: any) {
      console.error('Error creating webhook endpoint:', error);
      throw new AppError(
        `Failed to create webhook endpoint: ${error.message}`,
        500
      );
    }
  }

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        secret
      );

      return event;
    } catch (error: any) {
      console.error('Error constructing webhook event:', error);
      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        400
      );
    }
  }

  async calculatePlatformFee(amount: number, feePercentage: number = 10): Promise<number> {
    return Math.round((amount * feePercentage) / 100 * 100) / 100;
  }

  async calculateSellerPayout(amount: number, feePercentage: number = 10): Promise<number> {
    const platformFee = await this.calculatePlatformFee(amount, feePercentage);
    return Math.round((amount - platformFee) * 100) / 100;
  }
}

// Lazy initialization to ensure environment variables are loaded
let _stripeService: StripeService | null = null;

export const stripeService = {
  get instance() {
    if (!_stripeService) {
      _stripeService = new StripeService();
    }
    return _stripeService;
  }
};

export default stripeService;
