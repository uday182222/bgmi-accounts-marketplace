'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface DocumentUpload {
  id: string;
  type: 'id_front' | 'id_back' | 'selfie';
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected';
  error?: string;
}

const DOCUMENT_TYPES = {
  id_front: {
    label: 'ID Front',
    description: 'Front side of government-issued ID (Aadhaar, PAN, Driving License)',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  id_back: {
    label: 'ID Back',
    description: 'Back side of government-issued ID',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024,
  },
  selfie: {
    label: 'Selfie with ID',
    description: 'Selfie holding your ID next to your face',
    required: true,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
};

export default function KYCPage() {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected'>('not_started');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const handleFileUpload = (type: keyof typeof DOCUMENT_TYPES, file: File) => {
    const docType = DOCUMENT_TYPES[type];
    
    // Validate file type
    if (!docType.acceptedTypes.includes(file.type)) {
      alert(`Invalid file type. Please upload ${docType.acceptedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > docType.maxSize) {
      alert(`File too large. Maximum size is ${docType.maxSize / (1024 * 1024)}MB`);
      return;
    }

    const newDoc: DocumentUpload = {
      id: `${type}_${Date.now()}`,
      type,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    };

    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.type !== type);
      return [...filtered, newDoc];
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: keyof typeof DOCUMENT_TYPES) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(type, files[0]);
    }
  };

  const uploadDocument = async (document: DocumentUpload) => {
    const formData = new FormData();
    formData.append('file', document.file);
    formData.append('type', document.type);
    formData.append('userId', 'current-user-id'); // Replace with actual user ID

    try {
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? { ...doc, status: 'uploading' } : doc
      ));

      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? { ...doc, status: 'uploaded' } : doc
      ));
    } catch (error) {
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id ? { ...doc, status: 'pending', error: 'Upload failed' } : doc
      ));
    }
  };

  const submitKYC = async () => {
    setIsSubmitting(true);
    
    try {
      // Upload all documents
      for (const doc of documents) {
        if (doc.status === 'pending') {
          await uploadDocument(doc);
        }
      }

      // Submit KYC application
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo,
          documents: documents.map(doc => ({
            type: doc.type,
            fileId: doc.id,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('KYC submission failed');
      }

      setKycStatus('pending_review');
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Failed to submit KYC application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: DocumentUpload['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'uploading':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DocumentUpload['status']) => {
    const variants = {
      pending: 'secondary',
      uploading: 'default',
      uploaded: 'default',
      verified: 'default',
      rejected: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isFormValid = () => {
    const requiredDocs = Object.entries(DOCUMENT_TYPES)
      .filter(([_, config]) => config.required)
      .map(([type]) => type as keyof typeof DOCUMENT_TYPES);

    const hasRequiredDocs = requiredDocs.every(type => 
      documents.some(doc => doc.type === type && doc.status === 'uploaded')
    );

    const hasPersonalInfo = Object.values(personalInfo).every(value => value.trim() !== '');

    return hasRequiredDocs && hasPersonalInfo;
  };

  if (kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification Approved</h1>
            <p className="text-gray-600 mb-6">
              Your identity has been successfully verified. You can now accept platform offers and receive payouts.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification Rejected</h1>
            <p className="text-gray-600 mb-6">
              Your KYC verification was rejected. Please review the requirements and submit again with clear, legible documents.
            </p>
            <Button onClick={() => setKycStatus('not_started')}>
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (kycStatus === 'pending_review') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Under Review</h1>
            <p className="text-gray-600 mb-6">
              Your KYC application is being reviewed by our team. This usually takes 1-2 business days.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification (KYC)</h1>
          <p className="text-gray-600">
            Complete your identity verification to sell BGMI accounts and receive payouts. Only ID + selfie required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <Input
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <Input
                    value={personalInfo.zipCode}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Document Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
            <div className="space-y-4">
              {Object.entries(DOCUMENT_TYPES).map(([type, config]) => {
                const doc = documents.find(d => d.type === type);
                
                return (
                  <div key={type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{config.label}</span>
                        {config.required && <span className="text-red-500">*</span>}
                      </div>
                      {doc && (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          {getStatusBadge(doc.status)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                    
                    {doc ? (
                      <div className="space-y-2">
                        <img
                          src={doc.preview}
                          alt={config.label}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          >
                            Remove
                          </Button>
                          {doc.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => uploadDocument(doc)}
                            >
                              Upload
                            </Button>
                          )}
                        </div>
                        {doc.error && (
                          <p className="text-sm text-red-600">{doc.error}</p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, type as keyof typeof DOCUMENT_TYPES)}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = config.acceptedTypes.join(',');
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleFileUpload(type as keyof typeof DOCUMENT_TYPES, file);
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {config.acceptedTypes.join(', ')} • Max {config.maxSize / (1024 * 1024)}MB
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={submitKYC}
            disabled={!isFormValid() || isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit KYC Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
