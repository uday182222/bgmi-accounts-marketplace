"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { 
  Shield, 
  Users, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  MessageSquare,
  Key,
  Timer,
  Gamepad2,
  Menu,
  ArrowLeft
} from "lucide-react";
import { SafePeriodTimer } from "@/components/ui/safe-period-timer";
import { NegotiationChat } from "@/components/ui/negotiation-chat";
import Link from "next/link";

interface BGMIListing {
  id: string;
  ign: string;
  bgmiId: string;
  title: string;
  description: string;
  askingPrice: number;
  images: string[];
  status: 'pending_review' | 'negotiating' | 'approved' | 'rejected' | 'credentials_submitted' | 'safe_period' | 'completed';
  adminCounterOffer?: number;
  finalPrice?: number;
  adminNotes: string;
  sellerId: string;
  createdAt: string;
  reviewedAt?: string;
  credentialsSubmittedAt?: string;
  safePeriodEnds?: string;
}

interface DashboardStats {
  totalSubmissions: number;
  pendingReview: number;
  negotiating: number;
  approved: number;
  inSafePeriod: number;
  completed: number;
  totalValue: number;
}

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [listings, setListings] = useState<BGMIListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<BGMIListing[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    negotiating: 0,
    approved: 0,
    inSafePeriod: 0,
    completed: 0,
    totalValue: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedListing, setSelectedListing] = useState<BGMIListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockListings: BGMIListing[] = [
      {
        id: "1",
        ign: "ProGamer123",
        bgmiId: "1234567890",
        title: "Diamond I BGMI Account with Rare Skins",
        description: "High-level account with multiple rare skins and achievements",
        askingPrice: 150,
        images: ["screenshot1.jpg", "screenshot2.jpg"],
        status: 'pending_review',
        adminNotes: "",
        sellerId: "user1",
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        ign: "AcePlayer",
        bgmiId: "9876543210",
        title: "Crown III BGMI Account",
        description: "Well-maintained account with good stats",
        askingPrice: 200,
        images: ["screenshot3.jpg"],
        status: 'negotiating',
        adminCounterOffer: 180,
        adminNotes: "Counter-offered due to market conditions",
        sellerId: "user2",
        createdAt: "2024-01-14T15:20:00Z",
        reviewedAt: "2024-01-15T09:15:00Z"
      },
      {
        id: "3",
        ign: "ConquerorKing",
        bgmiId: "5555555555",
        title: "Conqueror BGMI Account",
        description: "Top-tier account with all premium items",
        askingPrice: 500,
        images: ["screenshot4.jpg", "screenshot5.jpg"],
        status: 'safe_period',
        finalPrice: 450,
        adminNotes: "Approved after negotiation",
        sellerId: "user3",
        createdAt: "2024-01-13T12:45:00Z",
        reviewedAt: "2024-01-14T11:30:00Z",
        credentialsSubmittedAt: "2024-01-14T14:00:00Z",
        safePeriodEnds: "2024-01-16T14:00:00Z"
      }
    ];

    setListings(mockListings);
    setFilteredListings(mockListings);
    
    // Calculate stats
    const newStats: DashboardStats = {
      totalSubmissions: mockListings.length,
      pendingReview: mockListings.filter(l => l.status === 'pending_review').length,
      negotiating: mockListings.filter(l => l.status === 'negotiating').length,
      approved: mockListings.filter(l => l.status === 'approved').length,
      inSafePeriod: mockListings.filter(l => l.status === 'safe_period').length,
      completed: mockListings.filter(l => l.status === 'completed').length,
      totalValue: mockListings.reduce((sum, l) => sum + (l.finalPrice || l.askingPrice), 0)
    };
    
    setStats(newStats);
    setIsLoading(false);
  }, []);

  // Filter listings based on search and status
  useEffect(() => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.bgmiId.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(listing => listing.status === statusFilter);
    }

    setFilteredListings(filtered);
  }, [listings, searchTerm, statusFilter]);

  const handleReviewListing = async (listingId: string, action: 'approve' | 'reject' | 'counter', counterOffer?: number, notes?: string) => {
    try {
      // TODO: Implement API call
      console.log("Reviewing listing:", { listingId, action, counterOffer, notes });
      
      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? {
              ...listing,
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'negotiating',
              adminCounterOffer: counterOffer,
              adminNotes: notes || listing.adminNotes,
              reviewedAt: new Date().toISOString()
            }
          : listing
      ));
      
      setSelectedListing(null);
      
      addToast({
        type: 'success',
        title: 'Listing Updated',
        description: `Listing ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'counter-offered'} successfully`
      });
    } catch (error) {
      console.error("Error reviewing listing:", error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update listing. Please try again.'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case "negotiating":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50"><MessageSquare className="h-3 w-3 mr-1" />Negotiating</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "credentials_submitted":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50"><Key className="h-3 w-3 mr-1" />Credentials Submitted</Badge>;
      case "safe_period":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50"><Timer className="h-3 w-3 mr-1" />Safe Period</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white font-orbitron">
                Admin Dashboard
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                View Marketplace
              </Link>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                Admin
              </Badge>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">BGMI Admin Portal</h1>
              <p className="text-gray-400">
                Review submissions, negotiate prices, and manage safe periods
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSubmissions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pendingReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Negotiating</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.negotiating}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Safe Period</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.inSafePeriod}</p>
                </div>
                <Timer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safe Period Management */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Timer className="h-5 w-5 mr-2 text-orange-500" />
              Safe Period Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.filter(l => l.status === 'safe_period').map((listing) => (
                <SafePeriodTimer
                  key={listing.id}
                  startTime={listing.credentialsSubmittedAt || listing.createdAt}
                  durationHours={48}
                  isAdmin={true}
                  accountId={listing.id}
                  onExtend={async (additionalHours) => {
                    // TODO: Implement API call to extend safe period
                    console.log(`Extending safe period for listing ${listing.id} by ${additionalHours} hours`);
                    addToast({
                      type: 'success',
                      title: 'Safe Period Extended',
                      description: `Safe period extended by ${additionalHours} hours`
                    });
                  }}
                  onExpire={() => {
                    addToast({
                      type: 'warning',
                      title: 'Safe Period Expired',
                      description: `Safe period expired for ${listing.ign}. Please verify account access.`
                    });
                  }}
                />
              ))}
              
              {listings.filter(l => l.status === 'safe_period').length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <Timer className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>No accounts currently in safe period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BGMI Listings Queue */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">BGMI Listing Submissions</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by IGN, title, or BGMI ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="safe_period">Safe Period</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">🎮</div>
                    <div>
                      <h3 className="text-white font-medium">{listing.ign}</h3>
                      <p className="text-gray-400 text-sm">
                        {listing.title} • BGMI ID: {listing.bgmiId}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Submitted: {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">₹{listing.finalPrice || listing.askingPrice}</p>
                      {listing.adminCounterOffer && (
                        <p className="text-blue-400 text-sm">Counter: ₹{listing.adminCounterOffer}</p>
                      )}
                      {getStatusBadge(listing.status)}
                    </div>
                    
                    <Button
                      onClick={() => setSelectedListing(listing)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredListings.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No listings found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listing Review Modal */}
      {selectedListing && (
        <ListingReviewModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onReview={handleReviewListing}
        />
      )}
    </div>
  );
}

interface ListingReviewModalProps {
  listing: BGMIListing;
  onClose: () => void;
  onReview: (listingId: string, action: 'approve' | 'reject' | 'counter', counterOffer?: number, notes?: string) => void;
}

function ListingReviewModal({ listing, onClose, onReview }: ListingReviewModalProps) {
  const [notes, setNotes] = useState(listing.adminNotes);
  const [counterOffer, setCounterOffer] = useState(listing.adminCounterOffer?.toString() || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async (action: 'approve' | 'reject' | 'counter') => {
    setIsProcessing(true);
    try {
      const counterOfferValue = action === 'counter' ? parseFloat(counterOffer) : undefined;
      await onReview(listing.id, action, counterOfferValue, notes);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Review BGMI Listing</CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Listing Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm">IGN</label>
              <p className="text-white font-medium">{listing.ign}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">BGMI ID</label>
              <p className="text-white">{listing.bgmiId}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Title</label>
              <p className="text-white">{listing.title}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Asking Price</label>
              <p className="text-white font-medium">₹{listing.askingPrice}</p>
            </div>
            <div className="col-span-2">
              <label className="text-gray-400 text-sm">Description</label>
              <p className="text-white">{listing.description}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Status</label>
              <div className="mt-1">
                {listing.status === "pending_review" && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    <Clock className="h-3 w-3 mr-1" />Pending Review
                  </Badge>
                )}
                {listing.status === "negotiating" && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    <MessageSquare className="h-3 w-3 mr-1" />Negotiating
                  </Badge>
                )}
                {listing.status === "approved" && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    <CheckCircle className="h-3 w-3 mr-1" />Approved
                  </Badge>
                )}
                {listing.status === "rejected" && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                    <XCircle className="h-3 w-3 mr-1" />Rejected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Screenshots ({listing.images.length})</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listing.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`/api/placeholder/200/150`}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Counter Offer */}
          {listing.status === 'pending_review' && (
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Counter Offer (₹)</label>
              <Input
                type="number"
                placeholder="Enter counter offer amount"
                value={counterOffer}
                onChange={(e) => setCounterOffer(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}

          {/* Negotiation Chat */}
          {listing.status === 'negotiating' && (
            <NegotiationChat
              listingId={listing.id}
              sellerId={listing.sellerId}
              currentOffer={listing.adminCounterOffer}
              onOfferUpdate={(offer) => {
                // Update local state - this will be handled by parent component
                console.log("Offer updated:", offer);
              }}
              onAccept={() => {
                // Handle offer acceptance
                console.log("Offer accepted for listing:", listing.id);
              }}
              onReject={() => {
                // Handle offer rejection
                console.log("Offer rejected for listing:", listing.id);
              }}
              isAdmin={true}
            />
          )}

          {/* Admin Notes */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this listing..."
              rows={4}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Cancel
            </Button>
            {listing.status === 'pending_review' && (
              <>
                <Button
                  onClick={() => handleReview("reject")}
                  disabled={isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isProcessing ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  onClick={() => handleReview("counter")}
                  disabled={isProcessing || !counterOffer}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isProcessing ? "Countering..." : "Counter Offer"}
                </Button>
                <Button
                  onClick={() => handleReview("approve")}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isProcessing ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}