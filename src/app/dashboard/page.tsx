"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { 
  Plus, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  Gamepad2,
  BarChart3,
  Settings,
  Menu,
  Search,
  User,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  price: number;
  rank: string;
  level: number;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  views: number;
  createdAt: string;
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalEarnings: number;
  pendingPayouts: number;
}

export default function DashboardPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalEarnings: 0,
    pendingPayouts: 0
  });

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockListings: Listing[] = [
      {
        id: "1",
        title: "Diamond I BGMI Account",
        price: 150,
        rank: "Diamond I",
        level: 45,
        status: "active",
        views: 234,
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        title: "Crown III BGMI Account",
        price: 200,
        rank: "Crown III",
        level: 67,
        status: "sold",
        views: 456,
        createdAt: "2024-01-14T15:20:00Z"
      },
      {
        id: "3",
        title: "Ace BGMI Account",
        price: 300,
        rank: "Ace",
        level: 32,
        status: "pending",
        views: 123,
        createdAt: "2024-01-13T12:45:00Z"
      }
    ];

    setListings(mockListings);
    setStats({
      totalListings: 3,
      activeListings: 1,
      soldListings: 1,
      totalEarnings: 200,
      pendingPayouts: 150
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'sold': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'sold': return <DollarSign className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
              <Link href="/list-account" className="text-gray-300 hover:text-white transition-colors">
                Sell Account
              </Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search BGMI accounts..."
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-64"
                />
              </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">Seller Dashboard</h1>
              <p className="text-gray-400">
                Manage your BGMI account listings and track your earnings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Listings</p>
                  <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-white">{stats.activeListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Sold</p>
                  <p className="text-2xl font-bold text-white">{stats.soldListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">₹{stats.totalEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Pending Payouts</p>
                  <p className="text-2xl font-bold text-white">₹{stats.pendingPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 font-orbitron">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/list-account">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                List New BGMI Account
              </Button>
            </Link>
            <Link href="/payouts">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payouts
              </Button>
            </Link>
            <Link href="/kyc">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete KYC
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Listings */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white font-orbitron">Your BGMI Listings</h2>
            <Link href="/list-account">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                        <Badge className={`${getStatusColor(listing.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(listing.status)}
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span>Rank: {listing.rank}</span>
                        <span>Level: {listing.level}</span>
                        <span>Views: {listing.views}</span>
                        <span>Created: {new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">₹{listing.price}</p>
                        <p className="text-sm text-gray-400">Platform fee: ₹{Math.round(listing.price * 0.15)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {listing.status === 'active' && (
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
