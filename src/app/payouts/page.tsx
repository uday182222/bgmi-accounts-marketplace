'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Banknote, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Settings,
  History,
  TrendingUp
} from 'lucide-react';

interface PayoutMethod {
  id: string;
  type: 'bank_account' | 'paypal' | 'stripe_connect';
  isDefault: boolean;
  status: 'active' | 'pending' | 'failed' | 'deactivated';
  details: {
    bankName?: string;
    accountHolderName?: string;
    paypalEmail?: string;
    stripeAccountStatus?: string;
  };
  createdAt: string;
}

interface Payout {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processedAt?: string;
  createdAt: string;
  metadata: {
    accountTitle: string;
    platformCommission: number;
    netAmount: number;
  };
}

interface PayoutSummary {
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
  availableBalance: number;
  nextPayoutDate?: string;
  lastPayoutDate?: string;
}

export default function PayoutsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'history'>('overview');
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);

  useEffect(() => {
    loadPayoutData();
  }, []);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);
      
      // Load payout methods
      const methodsResponse = await fetch('/api/payouts/methods');
      const methodsData = await methodsResponse.json();
      if (methodsData.success) {
        setPayoutMethods(methodsData.data.payoutMethods);
      }

      // Load payout history
      const historyResponse = await fetch('/api/payouts/history');
      const historyData = await historyResponse.json();
      if (historyData.success) {
        setPayouts(historyData.data.payouts);
      }

      // Load payout summary
      const summaryResponse = await fetch('/api/payouts/summary');
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
        return <Banknote className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      case 'stripe_connect':
        return <Settings className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts</h1>
          <p className="text-gray-600">
            Manage your payout methods and track your earnings.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'methods', label: 'Payout Methods', icon: Settings },
              { id: 'history', label: 'History', icon: History },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'methods' | 'history')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid gap-6 md:grid-cols-4">
                <Card className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.totalEarnings)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.totalPayouts)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.pendingPayouts)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <Banknote className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.availableBalance)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Recent Payouts */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Payouts</h2>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('history')}
                >
                  View All
                </Button>
              </div>
              
              {payouts.length === 0 ? (
                <div className="text-center py-8">
                  <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payouts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.slice(0, 5).map(payout => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payout.status)}
                        <div>
                          <p className="font-medium text-gray-900">{payout.metadata.accountTitle}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payout.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(payout.metadata.netAmount)}
                        </p>
                        {getStatusBadge(payout.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Payout Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Payout Methods</h2>
              <Button onClick={() => setShowAddMethod(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>

            {payoutMethods.length === 0 ? (
              <Card className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payout methods</h3>
                <p className="text-gray-500 mb-4">
                  Add a payout method to receive payments for your verified accounts.
                </p>
                <Button onClick={() => setShowAddMethod(true)}>
                  Add Your First Method
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {payoutMethods.map(method => (
                  <Card key={method.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getMethodIcon(method.type)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {method.type === 'bank_account' && method.details.bankName}
                            {method.type === 'paypal' && 'PayPal'}
                            {method.type === 'stripe_connect' && 'Stripe Connect'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.type === 'bank_account' && method.details.accountHolderName}
                            {method.type === 'paypal' && method.details.paypalEmail}
                            {method.type === 'stripe_connect' && method.details.stripeAccountStatus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                        <Badge variant="secondary">{method.status}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
            
            {payouts.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payout history yet</p>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="space-y-4">
                  {payouts.map(payout => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payout.status)}
                        <div>
                          <p className="font-medium text-gray-900">{payout.metadata.accountTitle}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payout.createdAt)}
                            {payout.processedAt && ` • Processed: ${formatDate(payout.processedAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(payout.metadata.netAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Commission: {formatCurrency(payout.metadata.platformCommission)}
                        </p>
                        {getStatusBadge(payout.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
