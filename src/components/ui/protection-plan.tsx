"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Clock, CheckCircle, AlertTriangle, DollarSign, Star } from "lucide-react";

interface ProtectionPlanProps {
  isActive: boolean;
  startDate?: string;
  durationDays?: number; // Default 10 days
  onPurchase?: () => void;
  onRedeem?: () => void;
  price?: number;
  accountId?: string;
  isBuyer?: boolean;
  isSeller?: boolean;
}

export function ProtectionPlan({ 
  isActive = false,
  startDate,
  durationDays = 10,
  onPurchase,
  onRedeem,
  price = 50,
  accountId,
  isBuyer = false,
  isSeller = false
}: ProtectionPlanProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, total: 0 });
  
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isActive || !startDate) return;

    const calculateTimeLeft = () => {
      const start = new Date(startDate).getTime();
      const end = start + (durationDays * 24 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes, total: difference });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, total: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [isActive, startDate, durationDays]);

  const getStatusColor = () => {
    if (!isActive) return "text-gray-400";
    if (isExpired) return "text-red-400";
    if (timeLeft.days < 2) return "text-orange-400";
    if (timeLeft.days < 5) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusBadge = () => {
    if (!isActive) {
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
          Not Active
        </Badge>
      );
    }
    
    if (isExpired) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    
    if (timeLeft.days < 2) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Ending Soon
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
        <Shield className="h-3 w-3 mr-1" />
        Active
      </Badge>
    );
  };

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            Protection Plan
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          // Purchase Protection Plan
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">10-Day Protection Plan</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get {durationDays} days of protection for account issues and disputes
              </p>
              <div className="text-2xl font-bold text-green-400 mb-4">₹{price}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Account access guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Dispute resolution support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Full refund if account issues</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Priority customer support</span>
              </div>
            </div>

            {onPurchase && (
              <Button
                onClick={onPurchase}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              >
                <Shield className="h-4 w-4 mr-2" />
                Purchase Protection Plan
              </Button>
            )}
          </div>
        ) : (
          // Active Protection Plan
          <div className="space-y-4">
            {!isExpired ? (
              <>
                {/* Timer Display */}
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-2">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getStatusColor()}`}>
                        {formatTime(timeLeft.days)}
                      </div>
                      <div className="text-gray-400 text-xs">Days</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">:</div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getStatusColor()}`}>
                        {formatTime(timeLeft.hours)}
                      </div>
                      <div className="text-gray-400 text-xs">Hours</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">:</div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getStatusColor()}`}>
                        {formatTime(timeLeft.minutes)}
                      </div>
                      <div className="text-gray-400 text-xs">Minutes</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Protection ends on {new Date(new Date(startDate!).getTime() + (durationDays * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      timeLeft.days < 2 ? 'bg-orange-500' : 
                      timeLeft.days < 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, (timeLeft.total / (durationDays * 24 * 60 * 60 * 1000)) * 100)}%` 
                    }}
                  />
                </div>

                {/* Status Messages */}
                {timeLeft.days < 2 && !isExpired && (
                  <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <p className="text-orange-400 text-sm">
                        Protection plan ending soon! Report any issues before expiration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Redeem Button */}
                {onRedeem && (
                  <Button
                    onClick={onRedeem}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue & Redeem
                  </Button>
                )}
              </>
            ) : (
              // Expired Protection Plan
              <div className="text-center space-y-4">
                <div className="text-6xl text-red-400 mb-4">
                  <AlertTriangle />
                </div>
                <h3 className="text-xl font-semibold text-red-400">Protection Plan Expired</h3>
                <p className="text-gray-400">
                  The protection period has ended. No further claims can be made.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Protection Plan Details</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• {durationDays}-day coverage for account issues</li>
                <li>• Full refund if account is inaccessible</li>
                <li>• Dispute resolution within 24 hours</li>
                <li>• Priority support during protection period</li>
                {isBuyer && <li>• Buyer protection against account issues</li>}
                {isSeller && <li>• Seller protection against false claims</li>}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
