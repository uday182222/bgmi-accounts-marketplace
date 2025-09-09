"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface SafePeriodTimerProps {
  startTime: string;
  durationHours: number; // Default 48 hours (2 days)
  onExpire?: () => void;
  onExtend?: (additionalHours: number) => void;
  isAdmin?: boolean;
  accountId?: string;
}

export function SafePeriodTimer({ 
  startTime, 
  durationHours = 48, 
  onExpire, 
  onExtend,
  isAdmin = false,
  accountId 
}: SafePeriodTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  
  const [isExpired, setIsExpired] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime();
      const end = start + (durationHours * 60 * 60 * 1000);
      const now = new Date().getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds, total: difference });
        setIsExpired(false);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, durationHours, onExpire]);

  const handleExtend = async (additionalHours: number) => {
    if (!onExtend) return;
    
    setIsExtending(true);
    try {
      await onExtend(additionalHours);
    } finally {
      setIsExtending(false);
    }
  };

  const getStatusColor = () => {
    if (isExpired) return "text-red-400";
    if (timeLeft.hours < 6) return "text-orange-400";
    if (timeLeft.hours < 24) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    
    if (timeLeft.hours < 6) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Ending Soon
        </Badge>
      );
    }
    
    if (timeLeft.hours < 24) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
        <Shield className="h-3 w-3 mr-1" />
        Safe Period
      </Badge>
    );
  };

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-semibold">Safe Period Timer</h3>
          </div>
          {getStatusBadge()}
        </div>

        {!isExpired ? (
          <div className="space-y-4">
            {/* Timer Display */}
            <div className="text-center">
              <div className="flex justify-center space-x-4 mb-2">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getStatusColor()}`}>
                    {formatTime(timeLeft.hours)}
                  </div>
                  <div className="text-gray-400 text-sm">Hours</div>
                </div>
                <div className="text-3xl font-bold text-gray-600">:</div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getStatusColor()}`}>
                    {formatTime(timeLeft.minutes)}
                  </div>
                  <div className="text-gray-400 text-sm">Minutes</div>
                </div>
                <div className="text-3xl font-bold text-gray-600">:</div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getStatusColor()}`}>
                    {formatTime(timeLeft.seconds)}
                  </div>
                  <div className="text-gray-400 text-sm">Seconds</div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm">
                Safe period ends on {new Date(new Date(startTime).getTime() + (durationHours * 60 * 60 * 1000)).toLocaleString()}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeLeft.hours < 6 ? 'bg-orange-500' : 
                  timeLeft.hours < 24 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.max(0, (timeLeft.total / (durationHours * 60 * 60 * 1000)) * 100)}%` 
                }}
              />
            </div>

            {/* Admin Controls */}
            {isAdmin && onExtend && (
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white font-medium mb-3">Admin Controls</h4>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleExtend(24)}
                    disabled={isExtending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    +24 Hours
                  </Button>
                  <Button
                    onClick={() => handleExtend(48)}
                    disabled={isExtending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    +48 Hours
                  </Button>
                  <Button
                    onClick={() => handleExtend(72)}
                    disabled={isExtending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    +72 Hours
                  </Button>
                </div>
                {isExtending && (
                  <p className="text-gray-400 text-sm mt-2">Extending safe period...</p>
                )}
              </div>
            )}

            {/* Status Messages */}
            {timeLeft.hours < 6 && !isExpired && (
              <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <p className="text-orange-400 text-sm">
                    Safe period ending soon! Please ensure account access is working properly.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl text-red-400 mb-4">
              <AlertTriangle />
            </div>
            <h3 className="text-xl font-semibold text-red-400">Safe Period Expired</h3>
            <p className="text-gray-400">
              The safe period has ended. Admin should verify account access and release payment.
            </p>
            {isAdmin && (
              <div className="space-y-2">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify & Release Payment
                </Button>
                <Button 
                  onClick={() => handleExtend(24)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Extend Safe Period
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Safe Period Information</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Admin tests account access during this period</li>
                <li>• Buyer can report issues within this timeframe</li>
                <li>• Payment is released after successful verification</li>
                <li>• Default duration: {durationHours} hours (admin adjustable)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
