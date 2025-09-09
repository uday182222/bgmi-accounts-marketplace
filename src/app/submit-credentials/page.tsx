"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Key,
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertTriangle,
  CheckCircle,
  Gamepad2,
  Menu
} from "lucide-react";
import Link from "next/link";

interface CredentialFormData {
  loginMethod: 'facebook' | 'twitter';
  loginId: string; // Facebook email/username or Twitter handle
  password: string;
  additionalInstructions: string;
  confirmPassword: string;
}

function SubmitCredentialsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get listing ID from URL params
  const listingId = searchParams.get('listingId');
  
  const [formData, setFormData] = useState<CredentialFormData>({
    loginMethod: 'facebook',
    loginId: '',
    password: '',
    additionalInstructions: '',
    confirmPassword: ''
  });

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  const handleInputChange = (field: keyof CredentialFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.loginId.trim()) {
      addToast({
        type: 'error',
        title: 'Login ID Required',
        description: 'Please enter your Facebook email/username or Twitter handle'
      });
      return false;
    }

    if (!formData.password.trim()) {
      addToast({
        type: 'error',
        title: 'Password Required',
        description: 'Please enter your account password'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both password fields match'
      });
      return false;
    }

    if (formData.password.length < 6) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit credentials securely
      console.log("Submitting credentials for listing:", listingId, {
        loginMethod: formData.loginMethod,
        loginId: formData.loginId,
        // Don't log password in console
        additionalInstructions: formData.additionalInstructions
      });
      
      addToast({
        type: 'success',
        title: 'Credentials Submitted',
        description: 'Your credentials have been securely submitted. Admin will test the account and initiate safe period.'
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit credentials. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <span className="text-xl font-bold text-white font-orbitron">
                BGMI Marketplace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                Browse Accounts
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileNavToggle}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onToggle={handleMobileNavToggle} onClose={handleMobileNavClose} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">Submit Credentials</h1>
              <p className="text-gray-400">
                Securely submit your BGMI account credentials after admin approval
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Security Notice */}
          <Card className="bg-blue-500/10 border-blue-500/50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Secure Credential Submission</h3>
                  <p className="text-gray-300 text-sm">
                    Your credentials are encrypted and stored securely. Only admin can access them for account testing. 
                    We only accept Facebook or Twitter login methods (no 2FA accounts).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credential Form */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2 text-red-500" />
                Account Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Login Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Login Method *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('loginMethod', 'facebook')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.loginMethod === 'facebook'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📘</div>
                        <div className="font-medium">Facebook</div>
                        <div className="text-xs text-gray-400">Email/Username</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('loginMethod', 'twitter')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.loginMethod === 'twitter'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🐦</div>
                        <div className="font-medium">Twitter</div>
                        <div className="text-xs text-gray-400">Handle/Email</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Login ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {formData.loginMethod === 'facebook' ? 'Facebook Email/Username' : 'Twitter Handle/Email'} *
                  </label>
                  <Input
                    type="text"
                    placeholder={
                      formData.loginMethod === 'facebook' 
                        ? "Enter your Facebook email or username"
                        : "Enter your Twitter handle or email"
                    }
                    value={formData.loginId}
                    onChange={(e) => handleInputChange('loginId', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your account password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions for accessing your account (e.g., specific login steps, account recovery info, etc.)"
                    value={formData.additionalInstructions}
                    onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-1">Important Security Notice</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Do not submit accounts with 2FA enabled</li>
                        <li>• Ensure your account is accessible with the provided credentials</li>
                        <li>• Admin will test the account before initiating safe period</li>
                        <li>• If login fails, account will be returned to you without changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Submit Credentials
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SubmitCredentialsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SubmitCredentialsContent />
    </Suspense>
  );
}
