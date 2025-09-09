import { AppError } from '../middleware/errorHandler';
import { notificationService } from './notificationService';

export interface SafeTransfer {
  id: string;
  accountId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'disputed';
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  monitoringInterval: number; // in minutes
  lastCheckTime?: Date;
  nextCheckTime?: Date;
  checksPerformed: number;
  suspiciousActivity: {
    detected: boolean;
    count: number;
    lastDetected?: Date;
    details: string[];
  };
  credentials: {
    encrypted: string;
    dataKey: string;
    releasedAt?: Date;
    releaseMethod: 'automatic' | 'manual' | 'disputed';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferCheck {
  id: string;
  transferId: string;
  checkTime: Date;
  status: 'success' | 'warning' | 'error';
  details: {
    accountAccessible: boolean;
    suspiciousActivity: boolean;
    sellerActivity: boolean;
    accountStatus: 'active' | 'banned' | 'restricted' | 'unknown';
    notes: string;
  };
  createdAt: Date;
}

export interface TransferAlert {
  id: string;
  transferId: string;
  type: 'suspicious_activity' | 'account_compromised' | 'seller_reclaim' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

class SafeTransferService {
  private readonly defaultDuration = 48; // 48 hours
  private readonly monitoringInterval = 30; // 30 minutes
  private readonly maxChecks = 96; // 96 checks over 48 hours (every 30 minutes)
  private activeTransfers = new Map<string, SafeTransfer>();
  private transferChecks = new Map<string, TransferCheck[]>();
  private transferAlerts = new Map<string, TransferAlert[]>();

  /**
   * Create a new safe transfer period
   */
  async createSafeTransfer(
    accountId: string,
    buyerId: string,
    sellerId: string,
    transactionId: string,
    encryptedCredentials: string,
    dataKey: string,
    duration: number = this.defaultDuration
  ): Promise<SafeTransfer> {
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
      const nextCheckTime = new Date(startTime.getTime() + this.monitoringInterval * 60 * 1000);

      const transfer: SafeTransfer = {
        id: `transfer_${accountId}_${Date.now()}`,
        accountId,
        buyerId,
        sellerId,
        transactionId,
        status: 'pending',
        startTime,
        endTime,
        duration,
        monitoringInterval: this.monitoringInterval,
        lastCheckTime: undefined,
        nextCheckTime,
        checksPerformed: 0,
        suspiciousActivity: {
          detected: false,
          count: 0,
          details: [],
        },
        credentials: {
          encrypted: encryptedCredentials,
          dataKey,
          releaseMethod: 'automatic',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store the transfer
      this.activeTransfers.set(transfer.id, transfer);
      this.transferChecks.set(transfer.id, []);
      this.transferAlerts.set(transfer.id, []);

      // Start monitoring
      await this.startMonitoring(transfer.id);

      // Send notifications
      await this.sendTransferNotifications(transfer, 'created');

      return transfer;
    } catch (error) {
      console.error('Error creating safe transfer:', error);
      throw new AppError('Failed to create safe transfer', 500);
    }
  }

  /**
   * Start monitoring a transfer
   */
  private async startMonitoring(transferId: string): Promise<void> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    // Update status to active
    transfer.status = 'active';
    transfer.updatedAt = new Date();

    // Schedule monitoring checks
    this.scheduleMonitoringChecks(transferId);
  }

  /**
   * Schedule monitoring checks for a transfer
   */
  private scheduleMonitoringChecks(transferId: string): void {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) return;

    const checkInterval = setInterval(async () => {
      try {
        await this.performTransferCheck(transferId);
      } catch (error) {
        console.error(`Error performing transfer check for ${transferId}:`, error);
      }
    }, transfer.monitoringInterval * 60 * 1000);

    // Store interval ID for cleanup
    (transfer as any).checkInterval = checkInterval;

    // Set timeout to complete transfer
    const completionTimeout = setTimeout(async () => {
      try {
        await this.completeTransfer(transferId);
      } catch (error) {
        console.error(`Error completing transfer ${transferId}:`, error);
      }
    }, transfer.duration * 60 * 60 * 1000);

    (transfer as any).completionTimeout = completionTimeout;
  }

  /**
   * Perform a monitoring check on a transfer
   */
  private async performTransferCheck(transferId: string): Promise<void> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer || transfer.status !== 'active') return;

    try {
      // Simulate account monitoring checks
      const checkResult = await this.checkAccountStatus(transfer);
      
      // Create check record
      const check: TransferCheck = {
        id: `check_${transferId}_${Date.now()}`,
        transferId,
        checkTime: new Date(),
        status: checkResult.status,
        details: checkResult.details,
        createdAt: new Date(),
      };

      // Store check
      const checks = this.transferChecks.get(transferId) || [];
      checks.push(check);
      this.transferChecks.set(transferId, checks);

      // Update transfer
      transfer.lastCheckTime = new Date();
      transfer.checksPerformed++;
      transfer.nextCheckTime = new Date(Date.now() + transfer.monitoringInterval * 60 * 1000);
      transfer.updatedAt = new Date();

      // Handle suspicious activity
      if (checkResult.details.suspiciousActivity) {
        await this.handleSuspiciousActivity(transferId, checkResult.details.notes);
      }

      // Check if transfer should be completed early
      if (this.shouldCompleteTransferEarly(transfer)) {
        await this.completeTransfer(transferId);
      }

    } catch (error) {
      console.error(`Error performing transfer check for ${transferId}:`, error);
      
      // Create error alert
      await this.createAlert(transferId, 'system_error', 'high', 'Transfer check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        checkTime: new Date(),
      });
    }
  }

  /**
   * Check account status (simulated)
   */
  private async checkAccountStatus(transfer: SafeTransfer): Promise<{
    status: 'success' | 'warning' | 'error';
    details: {
      accountAccessible: boolean;
      suspiciousActivity: boolean;
      sellerActivity: boolean;
      accountStatus: 'active' | 'banned' | 'restricted' | 'unknown';
      notes: string;
    };
  }> {
    // In a real implementation, this would:
    // 1. Check if the account is still accessible
    // 2. Monitor for suspicious login attempts
    // 3. Check if the seller has attempted to reclaim the account
    // 4. Verify the account hasn't been banned or restricted

    // Simulate random results for demo
    const random = Math.random();
    
    if (random < 0.05) { // 5% chance of suspicious activity
      return {
        status: 'warning',
        details: {
          accountAccessible: true,
          suspiciousActivity: true,
          sellerActivity: false,
          accountStatus: 'active',
          notes: 'Unusual login pattern detected',
        },
      };
    } else if (random < 0.1) { // 5% chance of error
      return {
        status: 'error',
        details: {
          accountAccessible: false,
          suspiciousActivity: false,
          sellerActivity: false,
          accountStatus: 'unknown',
          notes: 'Unable to verify account status',
        },
      };
    } else { // 90% chance of success
      return {
        status: 'success',
        details: {
          accountAccessible: true,
          suspiciousActivity: false,
          sellerActivity: false,
          accountStatus: 'active',
          notes: 'Account status normal',
        },
      };
    }
  }

  /**
   * Handle suspicious activity
   */
  private async handleSuspiciousActivity(transferId: string, details: string): Promise<void> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) return;

    transfer.suspiciousActivity.detected = true;
    transfer.suspiciousActivity.count++;
    transfer.suspiciousActivity.lastDetected = new Date();
    transfer.suspiciousActivity.details.push(`${new Date().toISOString()}: ${details}`);

    // Create alert
    await this.createAlert(
      transferId,
      'suspicious_activity',
      'high',
      'Suspicious activity detected during transfer period',
      { details, count: transfer.suspiciousActivity.count }
    );

    // Notify relevant parties
    await this.sendTransferNotifications(transfer, 'suspicious_activity');
  }

  /**
   * Check if transfer should be completed early
   */
  private shouldCompleteTransferEarly(transfer: SafeTransfer): boolean {
    // Complete early if no suspicious activity and minimum time has passed
    const minimumTime = 24; // 24 hours minimum
    const timeElapsed = (Date.now() - transfer.startTime.getTime()) / (1000 * 60 * 60);
    
    return !transfer.suspiciousActivity.detected && timeElapsed >= minimumTime;
  }

  /**
   * Complete a transfer
   */
  async completeTransfer(transferId: string): Promise<SafeTransfer> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    if (transfer.status !== 'active') {
      throw new AppError('Transfer is not active', 400);
    }

    // Update transfer status
    transfer.status = 'completed';
    transfer.credentials.releasedAt = new Date();
    transfer.updatedAt = new Date();

    // Clean up monitoring
    this.cleanupMonitoring(transferId);

    // Send completion notifications
    await this.sendTransferNotifications(transfer, 'completed');

    return transfer;
  }

  /**
   * Fail a transfer
   */
  async failTransfer(transferId: string, reason: string): Promise<SafeTransfer> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) {
      throw new AppError('Transfer not found', 404);
    }

    // Update transfer status
    transfer.status = 'failed';
    transfer.updatedAt = new Date();

    // Clean up monitoring
    this.cleanupMonitoring(transferId);

    // Create failure alert
    await this.createAlert(transferId, 'account_compromised', 'critical', reason, { reason });

    // Send failure notifications
    await this.sendTransferNotifications(transfer, 'failed');

    return transfer;
  }

  /**
   * Create a transfer alert
   */
  private async createAlert(
    transferId: string,
    type: TransferAlert['type'],
    severity: TransferAlert['severity'],
    message: string,
    details: Record<string, any>
  ): Promise<void> {
    const alert: TransferAlert = {
      id: `alert_${transferId}_${Date.now()}`,
      transferId,
      type,
      severity,
      message,
      details,
      acknowledged: false,
      createdAt: new Date(),
    };

    const alerts = this.transferAlerts.get(transferId) || [];
    alerts.push(alert);
    this.transferAlerts.set(transferId, alerts);
  }

  /**
   * Send transfer notifications
   */
  private async sendTransferNotifications(
    transfer: SafeTransfer,
    event: 'created' | 'completed' | 'failed' | 'suspicious_activity'
  ): Promise<void> {
    try {
      const notifications = [];

      // Notify buyer
      notifications.push({
        userId: transfer.buyerId,
        type: 'email',
        template: `transfer_${event}`,
        data: {
          transferId: transfer.id,
          accountId: transfer.accountId,
          status: transfer.status,
          endTime: transfer.endTime,
        },
      });

      // Notify seller
      notifications.push({
        userId: transfer.sellerId,
        type: 'email',
        template: `transfer_${event}`,
        data: {
          transferId: transfer.id,
          accountId: transfer.accountId,
          status: transfer.status,
          endTime: transfer.endTime,
        },
      });

      // Send notifications
      for (const notification of notifications) {
        if (notification.type === 'email') {
          await notificationService().sendSaleNotificationEmail(
            notification.userId,
            {
              game: 'BGMI',
              username: 'Account',
              price: 0
            },
            0
          );
        } else if (notification.type === 'sms') {
          await notificationService().sendSMSNotification(
            notification.userId,
            notification.template
          );
        }
      }
    } catch (error) {
      console.error('Error sending transfer notifications:', error);
    }
  }

  /**
   * Clean up monitoring resources
   */
  private cleanupMonitoring(transferId: string): void {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) return;

    // Clear intervals
    if ((transfer as any).checkInterval) {
      clearInterval((transfer as any).checkInterval);
    }
    if ((transfer as any).completionTimeout) {
      clearTimeout((transfer as any).completionTimeout);
    }
  }

  /**
   * Get transfer by ID
   */
  async getTransferById(transferId: string, userId: string): Promise<SafeTransfer | null> {
    const transfer = this.activeTransfers.get(transferId);
    
    if (!transfer) return null;

    // Check if user has access to this transfer
    if (transfer.buyerId !== userId && transfer.sellerId !== userId) {
      return null;
    }

    return transfer;
  }

  /**
   * Get transfers for a user
   */
  async getTransfersForUser(userId: string, status?: SafeTransfer['status']): Promise<SafeTransfer[]> {
    const transfers = Array.from(this.activeTransfers.values())
      .filter(transfer => 
        (transfer.buyerId === userId || transfer.sellerId === userId) &&
        (!status || transfer.status === status)
      );

    return transfers;
  }

  /**
   * Get transfer checks
   */
  async getTransferChecks(transferId: string, userId: string): Promise<TransferCheck[]> {
    const transfer = await this.getTransferById(transferId, userId);
    if (!transfer) return [];

    return this.transferChecks.get(transferId) || [];
  }

  /**
   * Get transfer alerts
   */
  async getTransferAlerts(transferId: string, userId: string): Promise<TransferAlert[]> {
    const transfer = await this.getTransferById(transferId, userId);
    if (!transfer) return [];

    return this.transferAlerts.get(transferId) || [];
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    transferId: string,
    alertId: string,
    userId: string
  ): Promise<void> {
    const transfer = await this.getTransferById(transferId, userId);
    if (!transfer) {
      throw new AppError('Transfer not found or access denied', 404);
    }

    const alerts = this.transferAlerts.get(transferId) || [];
    const alert = alerts.find(a => a.id === alertId);
    
    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
  }

  /**
   * Get all active transfers (admin only)
   */
  async getAllActiveTransfers(): Promise<SafeTransfer[]> {
    return Array.from(this.activeTransfers.values())
      .filter(transfer => transfer.status === 'active');
  }

  /**
   * Get transfer statistics
   */
  async getTransferStatistics(): Promise<{
    total: number;
    active: number;
    completed: number;
    failed: number;
    withSuspiciousActivity: number;
  }> {
    const transfers = Array.from(this.activeTransfers.values());
    
    return {
      total: transfers.length,
      active: transfers.filter(t => t.status === 'active').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      failed: transfers.filter(t => t.status === 'failed').length,
      withSuspiciousActivity: transfers.filter(t => t.suspiciousActivity.detected).length,
    };
  }
}

// Lazy initialization to ensure dotenv.config() has run
let _safeTransferService: SafeTransferService;

export const safeTransferService = () => {
  if (!_safeTransferService) {
    _safeTransferService = new SafeTransferService();
  }
  return _safeTransferService;
};
