"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/toast";
import { 
  Search, 
  Filter, 
  Heart, 
  Eye,
  Star,
  Shield,
  Gamepad2,
  DollarSign,
  TrendingUp,
  Grid,
  List,
  Menu,
  CheckCircle,
  Timer,
  User
} from "lucide-react";
import { ProtectionPlan } from "@/components/ui/protection-plan";
import Link from "next/link";

interface BGMIAccount {
  id: string;
  ign: string;
  bgmiId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  rank: string;
  level: number;
  status: 'approved' | 'safe_period' | 'completed';
  adminVerified: boolean;
  createdAt: string;
  approvedAt: string;
  safePeriodEnds?: string;
  protectionPlan?: boolean;
}

interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  minLevel: number;
  maxLevel: number;
  rank: string;
  sortBy: string;
  sortOrder: string;
  protectionPlan: boolean;
}

// BGMI-specific ranks
const bgmiRanks = [
  "Bronze V", "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
  "Silver V", "Silver IV", "Silver III", "Silver II", "Silver I",
  "Gold V", "Gold IV", "Gold III", "Gold II", "Gold I",
  "Platinum V", "Platinum IV", "Platinum III", "Platinum II", "Platinum I",
  "Diamond V", "Diamond IV", "Diamond III", "Diamond II", "Diamond I",
  "Crown V", "Crown IV", "Crown III", "Crown II", "Crown I",
  "Ace", "Ace Master", "Ace Dominator", "Conqueror"
];

export default function MarketplacePage() {
  const { addToast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [accounts, setAccounts] = useState<BGMIAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BGMIAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 10000,
    minLevel: 1,
    maxLevel: 100,
    rank: "all",
    sortBy: "price",
    sortOrder: "asc",
    protectionPlan: false
  });

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAccounts: BGMIAccount[] = [
      {
        id: "1",
        ign: "ProGamer123",
        bgmiId: "1234567890",
        title: "Diamond I BGMI Account with Rare Skins",
        description: "High-level account with multiple rare skins and achievements. Perfect for competitive play.",
        price: 150,
        images: ["screenshot1.jpg", "screenshot2.jpg"],
        rank: "Diamond I",
        level: 45,
        status: 'approved',
        adminVerified: true,
        createdAt: "2024-01-15T10:30:00Z",
        approvedAt: "2024-01-16T09:15:00Z",
        protectionPlan: true
      },
      {
        id: "2",
        ign: "AcePlayer",
        bgmiId: "9876543210",
        title: "Crown III BGMI Account",
        description: "Well-maintained account with good stats and premium items.",
        price: 200,
        images: ["screenshot3.jpg"],
        rank: "Crown III",
        level: 67,
        status: 'safe_period',
        adminVerified: true,
        createdAt: "2024-01-14T15:20:00Z",
        approvedAt: "2024-01-15T09:15:00Z",
        safePeriodEnds: "2024-01-17T09:15:00Z",
        protectionPlan: false
      },
      {
        id: "3",
        ign: "ConquerorKing",
        bgmiId: "5555555555",
        title: "Conqueror BGMI Account",
        description: "Top-tier account with all premium items and achievements.",
        price: 500,
        images: ["screenshot4.jpg", "screenshot5.jpg"],
        rank: "Conqueror",
        level: 89,
        status: 'approved',
        adminVerified: true,
        createdAt: "2024-01-13T12:45:00Z",
        approvedAt: "2024-01-14T11:30:00Z",
        protectionPlan: true
      }
    ];

    setAccounts(mockAccounts);
    setFilteredAccounts(mockAccounts);
    setIsLoading(false);
  }, []);

  // Filter and search accounts
  useEffect(() => {
    let filtered = accounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.ign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.rank.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(account =>
      account.price >= filters.minPrice && account.price <= filters.maxPrice
    );

    // Level filter
    filtered = filtered.filter(account =>
      account.level >= filters.minLevel && account.level <= filters.maxLevel
    );

    // Rank filter
    if (filters.rank !== "all") {
      filtered = filtered.filter(account => account.rank === filters.rank);
    }

    // Protection plan filter
    if (filters.protectionPlan) {
      filtered = filtered.filter(account => account.protectionPlan);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "level":
          aValue = a.level;
          bValue = b.level;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.price;
          bValue = b.price;
      }

      if (filters.sortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, filters]);

  const handlePurchase = (accountId: string) => {
    // TODO: Implement admin-mediated purchase flow
    addToast({
      type: 'info',
      title: 'Admin-Mediated Purchase',
      description: 'Purchase will be processed through admin with Stripe integration and protection plan options'
    });
  };

  const handleProtectionPlanPurchase = (accountId: string) => {
    // TODO: Implement protection plan purchase
    addToast({
      type: 'info',
      title: 'Protection Plan',
      description: 'Protection plan purchase will be integrated with the main purchase flow'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>;
      case "safe_period":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50"><Timer className="h-3 w-3 mr-1" />Safe Period</Badge>;
      case "completed":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">Sold</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes("Bronze")) return "text-orange-400";
    if (rank.includes("Silver")) return "text-gray-300";
    if (rank.includes("Gold")) return "text-yellow-400";
    if (rank.includes("Platinum")) return "text-blue-400";
    if (rank.includes("Diamond")) return "text-purple-400";
    if (rank.includes("Crown")) return "text-red-400";
    if (rank.includes("Ace")) return "text-pink-400";
    if (rank.includes("Conqueror")) return "text-red-500";
    return "text-white";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading marketplace...</div>
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
              <Gamepad2 className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white font-orbitron">
                BGMI Marketplace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/list-account" className="text-gray-300 hover:text-white transition-colors">
                Sell Account
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-orbitron">BGMI Marketplace</h1>
              <p className="text-gray-400">
                Browse admin-verified BGMI accounts ready for purchase
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Shield className="h-3 w-3 mr-1" />
                Admin Verified
              </Badge>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search BGMI accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex border border-gray-600 rounded-lg">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Price Range</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 10000 }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Level Range</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, minLevel: parseInt(e.target.value) || 1 }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxLevel: parseInt(e.target.value) || 100 }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Rank</label>
                  <select
                    value={filters.rank}
                    onChange={(e) => setFilters(prev => ({ ...prev, rank: e.target.value }))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="all">All Ranks</option>
                    {bgmiRanks.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="price">Price</option>
                    <option value="level">Level</option>
                    <option value="created">Newest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.protectionPlan}
                    onChange={(e) => setFilters(prev => ({ ...prev, protectionPlan: e.target.checked }))}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-gray-300 text-sm">Protection Plan Only</span>
                </label>

                <Button
                  onClick={() => setFilters({
                    minPrice: 0,
                    maxPrice: 10000,
                    minLevel: 1,
                    maxLevel: 100,
                    rank: "all",
                    sortBy: "price",
                    sortOrder: "asc",
                    protectionPlan: false
                  })}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredAccounts.length} of {accounts.length} admin-verified BGMI accounts
          </p>
        </div>

        {/* Accounts Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Account Image */}
                    <div className="relative">
                      <img
                        src="/api/placeholder/300/200"
                        alt={account.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(account.status)}
                      </div>
                      {account.protectionPlan && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Protection
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{account.ign}</h3>
                      <p className="text-gray-400 text-sm mb-2">{account.title}</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{account.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className={`font-medium ${getRankColor(account.rank)}`}>
                          {account.rank}
                        </span>
                        <span className="text-gray-400">Level {account.level}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">₹{account.price}</p>
                        <p className="text-gray-400 text-xs">BGMI ID: {account.bgmiId}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePurchase(account.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                        disabled={account.status !== 'approved'}
                      >
                        {account.status === 'approved' ? 'Purchase from Admin' : 'Not Available'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <Card key={account.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    <img
                      src="/api/placeholder/150/100"
                      alt={account.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{account.ign}</h3>
                          <p className="text-gray-400 text-sm mb-1">{account.title}</p>
                          <p className="text-gray-300 text-sm line-clamp-1">{account.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-xl">₹{account.price}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(account.status)}
                            {account.protectionPlan && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                <Shield className="h-3 w-3 mr-1" />
                                Protection
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${getRankColor(account.rank)}`}>
                            {account.rank}
                          </span>
                          <span className="text-gray-400">Level {account.level}</span>
                          <span className="text-gray-400">BGMI ID: {account.bgmiId}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handlePurchase(account.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                            disabled={account.status !== 'approved'}
                          >
                            {account.status === 'approved' ? 'Purchase from Admin' : 'Not Available'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No accounts found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilters({
                  minPrice: 0,
                  maxPrice: 10000,
                  minLevel: 1,
                  maxLevel: 100,
                  rank: "all",
                  sortBy: "price",
                  sortOrder: "asc",
                  protectionPlan: false
                });
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}