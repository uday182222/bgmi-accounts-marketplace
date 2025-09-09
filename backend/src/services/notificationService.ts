import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  CreateTemplateCommand,
  GetTemplateCommand
} from '@aws-sdk/client-ses';
import {
  SNSClient,
  PublishCommand,
  CreateTopicCommand,
  SubscribeCommand,
  GetTopicAttributesCommand
} from '@aws-sdk/client-sns';
import { AWS_CONFIG } from '../config/aws';
import { AppError } from '../middleware/errorHandler';

class NotificationService {
  private sesClient: SESClient;
  private snsClient: SNSClient;

  constructor() {
    this.sesClient = new SESClient({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      },
    });
    
    this.snsClient = new SNSClient({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      },
    });
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    htmlBody: string,
    textBody?: string,
    from?: string
  ): Promise<void> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const command = new SendEmailCommand({
        Source: from || AWS_CONFIG.sesFromEmail,
        Destination: {
          ToAddresses: recipients,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            ...(textBody && {
              Text: {
                Data: textBody,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      });

      await this.sesClient.send(command);
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new AppError(
        `Failed to send email: ${error.message}`,
        500
      );
    }
  }

  async sendTemplatedEmail(
    to: string | string[],
    templateName: string,
    templateData: Record<string, any>,
    from?: string
  ): Promise<void> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const command = new SendTemplatedEmailCommand({
        Source: from || AWS_CONFIG.sesFromEmail,
        Destination: {
          ToAddresses: recipients,
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
      });

      await this.sesClient.send(command);
    } catch (error: any) {
      console.error('Error sending templated email:', error);
      throw new AppError(
        `Failed to send templated email: ${error.message}`,
        500
      );
    }
  }

  async sendSMS(
    phoneNumber: string,
    message: string,
    topicArn?: string
  ): Promise<void> {
    try {
      const targetArn = topicArn || AWS_CONFIG.snsTopicArn;
      
      if (!targetArn) {
        throw new Error('SNS Topic ARN not configured');
      }

      const command = new PublishCommand({
        TopicArn: targetArn,
        Message: message,
        MessageAttributes: {
          'phoneNumber': {
            DataType: 'String',
            StringValue: phoneNumber,
          },
        },
      });

      await this.snsClient.send(command);
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      throw new AppError(
        `Failed to send SMS: ${error.message}`,
        500
      );
    }
  }

  async createEmailTemplate(
    templateName: string,
    subject: string,
    htmlPart: string,
    textPart?: string
  ): Promise<void> {
    try {
      const command = new CreateTemplateCommand({
        Template: {
          TemplateName: templateName,
          SubjectPart: subject,
          HtmlPart: htmlPart,
          TextPart: textPart,
        },
      });

      await this.sesClient.send(command);
    } catch (error: any) {
      console.error('Error creating email template:', error);
      throw new AppError(
        `Failed to create email template: ${error.message}`,
        500
      );
    }
  }

  async createSNSTopic(topicName: string): Promise<string> {
    try {
      const command = new CreateTopicCommand({
        Name: topicName,
      });

      const response = await this.snsClient.send(command);
      
      if (!response.TopicArn) {
        throw new Error('Failed to create SNS topic');
      }

      return response.TopicArn;
    } catch (error: any) {
      console.error('Error creating SNS topic:', error);
      throw new AppError(
        `Failed to create SNS topic: ${error.message}`,
        500
      );
    }
  }

  async subscribeToTopic(
    topicArn: string,
    protocol: 'email' | 'sms' | 'sqs',
    endpoint: string
  ): Promise<string> {
    try {
      const command = new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: protocol,
        Endpoint: endpoint,
      });

      const response = await this.snsClient.send(command);
      
      if (!response.SubscriptionArn) {
        throw new Error('Failed to subscribe to topic');
      }

      return response.SubscriptionArn;
    } catch (error: any) {
      console.error('Error subscribing to topic:', error);
      throw new AppError(
        `Failed to subscribe to topic: ${error.message}`,
        500
      );
    }
  }

  // Notification templates
  async sendAccountVerificationEmail(
    to: string,
    username: string,
    game: string,
    verificationLink?: string
  ): Promise<void> {
    const subject = `Account Verification - ${game.toUpperCase()} Account`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff3333;">Account Verification Required</h2>
        <p>Hello,</p>
        <p>Your ${game.toUpperCase()} account listing for <strong>${username}</strong> has been submitted and is pending verification.</p>
        <p>Our admin team will review your account within 24-48 hours. You will receive an email notification once the verification is complete.</p>
        ${verificationLink ? `<p><a href="${verificationLink}" style="background-color: #ff3333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Listing Status</a></p>` : ''}
        <p>Thank you for using our platform!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, htmlBody);
  }

  async sendAccountApprovedEmail(
    to: string,
    username: string,
    game: string,
    price: number
  ): Promise<void> {
    const subject = `Account Approved - ${game.toUpperCase()} Account`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00aa00;">Account Approved! 🎉</h2>
        <p>Hello,</p>
        <p>Great news! Your ${game.toUpperCase()} account listing for <strong>${username}</strong> has been approved and is now live on our marketplace.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Account Details:</strong></p>
          <p>Game: ${game.toUpperCase()}</p>
          <p>Username: ${username}</p>
          <p>Listed Price: $${price}</p>
        </div>
        <p>Your account is now visible to potential buyers. You'll receive notifications when someone shows interest or makes a purchase.</p>
        <p>Thank you for using our platform!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, htmlBody);
  }

  async sendAccountRejectedEmail(
    to: string,
    username: string,
    game: string,
    reason: string
  ): Promise<void> {
    const subject = `Account Rejected - ${game.toUpperCase()} Account`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff3333;">Account Rejected</h2>
        <p>Hello,</p>
        <p>Unfortunately, your ${game.toUpperCase()} account listing for <strong>${username}</strong> has been rejected during the verification process.</p>
        <div style="background-color: #ffe6e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Reason for rejection:</strong></p>
          <p>${reason}</p>
        </div>
        <p>You can submit a new listing with corrected information. If you believe this is an error, please contact our support team.</p>
        <p>Thank you for using our platform!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, htmlBody);
  }

  async sendPurchaseConfirmationEmail(
    to: string,
    accountDetails: {
      game: string;
      username: string;
      price: number;
    },
    transactionId: string
  ): Promise<void> {
    const subject = `Purchase Confirmation - ${accountDetails.game.toUpperCase()} Account`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00aa00;">Purchase Successful! 🎉</h2>
        <p>Hello,</p>
        <p>Congratulations! You have successfully purchased a ${accountDetails.game.toUpperCase()} account.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Purchase Details:</strong></p>
          <p>Game: ${accountDetails.game.toUpperCase()}</p>
          <p>Username: ${accountDetails.username}</p>
          <p>Price: $${accountDetails.price}</p>
          <p>Transaction ID: ${transactionId}</p>
        </div>
        <p>Your account credentials will be sent to you within 24 hours after the safe transfer period.</p>
        <p>Thank you for your purchase!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, htmlBody);
  }

  async sendSaleNotificationEmail(
    to: string,
    accountDetails: {
      game: string;
      username: string;
      price: number;
    },
    payoutAmount: number
  ): Promise<void> {
    const subject = `Account Sold - ${accountDetails.game.toUpperCase()} Account`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00aa00;">Account Sold! 💰</h2>
        <p>Hello,</p>
        <p>Great news! Your ${accountDetails.game.toUpperCase()} account has been sold!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Sale Details:</strong></p>
          <p>Game: ${accountDetails.game.toUpperCase()}</p>
          <p>Username: ${accountDetails.username}</p>
          <p>Sale Price: $${accountDetails.price}</p>
          <p>Your Payout: $${payoutAmount}</p>
        </div>
        <p>Your payout will be processed within 1-2 business days to your registered payment method.</p>
        <p>Thank you for using our platform!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;

    await this.sendEmail(to, subject, htmlBody);
  }

  async sendSMSNotification(
    phoneNumber: string,
    message: string
  ): Promise<void> {
    await this.sendSMS(phoneNumber, message);
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _notificationService: NotificationService;

export const notificationService = () => {
  if (!_notificationService) {
    _notificationService = new NotificationService();
  }
  return _notificationService;
};
export default notificationService;
