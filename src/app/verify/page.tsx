'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MobileNav } from '@/components/mobile-nav';
import { useToast } from '@/components/ui/toast';
import { 
  Gamepad2,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [verificationType, setVerificationType] = useState<'email' | 'sms'>('email');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      addToast({
        type: 'error',
        title: 'Code Required',
        description: 'Please enter the verification code'
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast({
        type: 'success',
        title: 'Verification Successful',
        description: 'Your account has been verified successfully!'
      });
      
      router.push('/accounts');
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid verification code. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      // TODO: Implement actual resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimeLeft(300); // Reset timer
      addToast({
        type: 'success',
        title: 'Code Sent',
        description: `New verification code sent to your ${verificationType}`
      });
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Resend Failed',
        description: error instanceof Error ? error.message : 'Failed to resend code. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white font-orbitron">
                GameSwap
              </span>
            </Link>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/accounts">
                <Button variant="outline" size="sm">
                  Browse Accounts
                </Button>
              </Link>
              <Button variant="default" size="sm" className="red-gradient">
                Sell Now
              </Button>
            </div>

            {/* Mobile Navigation */}
            <MobileNav
              isOpen={isMobileNavOpen}
              onToggle={handleMobileNavToggle}
              onClose={handleMobileNavClose}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            href="/signup"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signup
          </Link>

          {/* Verification Card */}
          <Card className="bg-gray-900/50 border-gray-700 animate-scale-in">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                  {verificationType === 'email' ? (
                    <Mail className="h-8 w-8 text-red-500" />
                  ) : (
                    <Phone className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Verify Your Account</h1>
                <p className="text-gray-400">
                  We&apos;ve sent a verification code to your {verificationType}
                </p>
                {email && (
                  <p className="text-red-400 font-medium mt-2">{email}</p>
                )}
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-white mb-2">
                    Verification Code
                  </label>
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                {/* Timer */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <div className="flex items-center justify-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Code expires in {formatTime(timeLeft)}
                    </div>
                  ) : (
                    <div className="text-sm text-red-400">
                      Verification code has expired
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full red-gradient"
                  loading={isLoading}
                  disabled={isLoading || timeLeft === 0}
                >
                  {isLoading ? "Verifying..." : "Verify Account"}
                </Button>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    Didn&apos;t receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendCode}
                    loading={isResending}
                    disabled={isResending || timeLeft > 240} // Can resend after 1 minute
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Code
                  </Button>
                </div>
              </form>

              {/* Change Verification Method */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-3">
                    Want to verify via {verificationType === 'email' ? 'SMS' : 'email'} instead?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVerificationType(verificationType === 'email' ? 'sms' : 'email')}
                    className="text-red-400 hover:text-red-300"
                  >
                    Switch to {verificationType === 'email' ? 'SMS' : 'Email'}
                  </Button>
                </div>
              </div>

              {/* Help */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Having trouble? Check your spam folder or{' '}
                  <Link href="/support" className="text-red-400 hover:text-red-300">
                    contact support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
