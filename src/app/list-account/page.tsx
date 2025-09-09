"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/toast";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Gamepad2, 
  DollarSign,
  Shield,
  Eye,
  Save,
  CheckCircle,
  Menu,
  User,
  FileText,
  Camera
} from "lucide-react";
import Link from "next/link";

interface AccountFormData {
  ign: string; // In-Game Name
  bgmiId: string; // BGMI ID
  title: string;
  description: string;
  askingPrice: string; // Seller's asking price
  images: File[];
  // Credentials will be submitted separately after admin negotiation
}

export default function ListAccountPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AccountFormData>({
    ign: "",
    bgmiId: "",
    title: "",
    description: "",
    askingPrice: "",
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { number: 1, title: "Account Info", description: "IGN, BGMI ID, and title" },
    { number: 2, title: "Description", description: "Describe your account" },
    { number: 3, title: "Asking Price", description: "Set your asking price" },
    { number: 4, title: "Screenshots", description: "Upload profile + inventory screenshots" },
    { number: 5, title: "Review", description: "Review and submit to admin" }
  ];

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to admin portal - not public marketplace
      addToast({
        type: 'success',
        title: 'Submitted to Admin',
        description: 'Your listing has been submitted for admin review. You will be notified once reviewed.'
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit listing. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                In-Game Name (IGN) *
              </label>
              <Input
                type="text"
                placeholder="Enter your BGMI IGN"
                value={formData.ign}
                onChange={(e) => handleInputChange('ign', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                BGMI ID *
              </label>
              <Input
                type="text"
                placeholder="Enter your BGMI ID (e.g., 1234567890)"
                value={formData.bgmiId}
                onChange={(e) => handleInputChange('bgmiId', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Listing Title *
              </label>
              <Input
                type="text"
                placeholder="e.g., Diamond I BGMI Account with Rare Skins"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Description
              </label>
              <textarea
                placeholder="Describe your account, including rank, level, skins, achievements, etc. (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Asking Price (₹) *
              </label>
              <Input
                type="number"
                placeholder="Enter your asking price"
                value={formData.askingPrice}
                onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
              />
              <p className="text-sm text-gray-400 mt-2">
                Admin may counter-offer or accept your price. Final price will be negotiated.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Screenshots *
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Upload 1 profile screenshot + 5-6 inventory screenshots
              </p>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="text-gray-300">Click to upload screenshots</span>
                  <span className="text-sm text-gray-400">PNG, JPG up to 10MB each</span>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Uploaded Images ({formData.images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Review Your Submission</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">IGN:</span>
                  <span className="text-white ml-2">{formData.ign}</span>
                </div>
                <div>
                  <span className="text-gray-400">BGMI ID:</span>
                  <span className="text-white ml-2">{formData.bgmiId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Title:</span>
                  <span className="text-white ml-2">{formData.title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Asking Price:</span>
                  <span className="text-white ml-2">₹{formData.askingPrice}</span>
                </div>
                <div>
                  <span className="text-gray-400">Screenshots:</span>
                  <span className="text-white ml-2">{formData.images.length} images</span>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white ml-2 mt-1">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium">Admin Review Process</h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Your listing will be reviewed by our admin team. They may counter-offer your price or request additional information. 
                    Credentials will only be requested after price negotiation is finalized.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
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
              <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">Submit to Admin</h1>
              <p className="text-gray-400">
                Submit your BGMI account for admin review and negotiation
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-red-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
              >
                {isSubmitting ? 'Submitting...' : 'Submit to Admin'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}