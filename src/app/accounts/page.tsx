"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search";
import { Dropdown } from "@/components/ui/dropdown";
import { MobileNav } from "@/components/mobile-nav";
import { 
  Gamepad2,
  Star,
  Shield,
  Clock,
  DollarSign,
  Eye,
  Heart,
  Share2
} from "lucide-react";

const mockAccounts = [
  {
    id: 1,
    game: "Fortnite",
    title: "Epic Fortnite Account - Battle Pass Complete",
    price: 299,
    originalPrice: 399,
    image: "/api/placeholder/300/200",
    rating: 4.8,
    reviews: 124,
    level: 150,
    skins: 45,
    vbucks: 2000,
    description: "Complete battle pass with all skins, emotes, and pickaxes. Rare items included.",
    seller: "ProGamer123",
    verified: true,
    createdAt: "2 days ago",
    tags: ["Battle Pass", "Rare Skins", "High Level"]
  },
  {
    id: 2,
    game: "Valorant",
    title: "Radiant Rank Account - All Agents Unlocked",
    price: 450,
    originalPrice: 600,
    image: "/api/placeholder/300/200",
    rating: 4.9,
    reviews: 89,
    level: 200,
    skins: 32,
    vbucks: 0,
    description: "Radiant rank achieved, all agents unlocked, premium skins included.",
    seller: "ValorantPro",
    verified: true,
    createdAt: "1 day ago",
    tags: ["Radiant", "All Agents", "Premium Skins"]
  },
  {
    id: 3,
    game: "League of Legends",
    title: "Diamond Rank Account - 100+ Champions",
    price: 199,
    originalPrice: 299,
    image: "/api/placeholder/300/200",
    rating: 4.7,
    reviews: 156,
    level: 180,
    skins: 67,
    vbucks: 0,
    description: "Diamond rank in multiple seasons, extensive champion collection.",
    seller: "LoLMaster",
    verified: true,
    createdAt: "3 days ago",
    tags: ["Diamond", "100+ Champions", "Multiple Seasons"]
  },
  {
    id: 4,
    game: "Roblox",
    title: "Premium Roblox Account - 50K Robux",
    price: 99,
    originalPrice: 149,
    image: "/api/placeholder/300/200",
    rating: 4.6,
    reviews: 203,
    level: 75,
    skins: 0,
    vbucks: 50000,
    description: "Premium account with 50,000 Robux and exclusive items.",
    seller: "RobloxKing",
    verified: true,
    createdAt: "5 days ago",
    tags: ["50K Robux", "Premium", "Exclusive Items"]
  },
  {
    id: 5,
    game: "Call of Duty",
    title: "MW3 Account - All Weapons Unlocked",
    price: 179,
    originalPrice: 249,
    image: "/api/placeholder/300/200",
    rating: 4.5,
    reviews: 78,
    level: 120,
    skins: 28,
    vbucks: 0,
    description: "Modern Warfare 3 account with all weapons and attachments unlocked.",
    seller: "CODExpert",
    verified: true,
    createdAt: "1 week ago",
    tags: ["All Weapons", "High Level", "MW3"]
  },
  {
    id: 6,
    game: "Discord",
    title: "Discord Nitro Account - 1 Year",
    price: 49,
    originalPrice: 99,
    image: "/api/placeholder/300/200",
    rating: 4.8,
    reviews: 45,
    level: 0,
    skins: 0,
    vbucks: 0,
    description: "Discord Nitro subscription with 1 year remaining.",
    seller: "DiscordPro",
    verified: true,
    createdAt: "4 days ago",
    tags: ["Nitro", "1 Year", "Premium Features"]
  }
];

const gameOptions = [
  { value: "all", label: "All Games" },
  { value: "fortnite", label: "Fortnite" },
  { value: "valorant", label: "Valorant" },
  { value: "league", label: "League of Legends" },
  { value: "roblox", label: "Roblox" },
  { value: "cod", label: "Call of Duty" },
  { value: "discord", label: "Discord" }
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
];

const priceRangeOptions = [
  { value: "all", label: "All Prices" },
  { value: "0-50", label: "Under $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "100-200", label: "$100 - $200" },
  { value: "200-500", label: "$200 - $500" },
  { value: "500+", label: "Over $500" }
];

export default function AccountsPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  const toggleFavorite = (accountId: number) => {
    setFavorites(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const filteredAccounts = mockAccounts.filter(account => {
    const matchesSearch = account.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                         account.description.toLowerCase().includes(searchValue.toLowerCase());
    const matchesGame = selectedGame === "all" || account.game.toLowerCase() === selectedGame;
    
    let matchesPrice = true;
    if (selectedPriceRange !== "all") {
      const [min, max] = selectedPriceRange.split("-").map(Number);
      if (max) {
        matchesPrice = account.price >= min && account.price <= max;
      } else {
        matchesPrice = account.price >= min;
      }
    }

    return matchesSearch && matchesGame && matchesPrice;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white font-orbitron">
                GameSwap
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search for gaming accounts..."
                className="w-full"
                showFilters
                onFilterClick={() => setShowFilters(!showFilters)}
              />
            </div>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Categories
              </Button>
              <Button variant="default" size="sm" className="red-gradient">
                Sell Now
              </Button>
              <Button variant="ghost" size="sm">
                Log In
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

      {/* Mobile Search */}
      <div className="md:hidden p-4 border-b border-gray-800">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search for gaming accounts..."
          className="w-full"
          showFilters
          onFilterClick={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* Filters */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Dropdown
              options={gameOptions}
              value={selectedGame}
              onValueChange={setSelectedGame}
              placeholder="All Games"
              className="w-40"
            />
            <Dropdown
              options={sortOptions}
              value={selectedSort}
              onValueChange={setSelectedSort}
              placeholder="Sort by"
              className="w-40"
            />
            <Dropdown
              options={priceRangeOptions}
              value={selectedPriceRange}
              onValueChange={setSelectedPriceRange}
              placeholder="Price Range"
              className="w-40"
            />
            <div className="ml-auto text-sm text-gray-400">
              {filteredAccounts.length} accounts found
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAccounts.map((account, index) => (
            <Card key={account.id} className={`card-hover group cursor-pointer animate-move-in-up animate-stagger-${(index % 6) + 1}`}>
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Gamepad2 className="h-16 w-16 text-gray-600" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                      <Badge 
                      variant="default" 
                      className="absolute top-4 left-4"
                    >
                    {account.game}
                  </Badge>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(account.id);
                      }}
                      className="h-8 w-8 bg-black/50 hover:bg-black/70"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(account.id) 
                            ? "text-red-500 fill-red-500" 
                            : "text-white"
                        }`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-black/50 hover:bg-black/70"
                    >
                      <Share2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  {account.originalPrice > account.price && (
                    <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      {Math.round((1 - account.price / account.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {account.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {account.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {account.rating} ({account.reviews})
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-400 mr-1" />
                      {account.verified ? "Verified" : "Unverified"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {account.createdAt}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {account.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        ${account.price}
                      </span>
                      {account.originalPrice > account.price && (
                        <span className="text-lg text-gray-400 line-through">
                          ${account.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div>Level {account.level}</div>
                      {account.skins > 0 && <div>{account.skins} skins</div>}
                      {account.vbucks > 0 && <div>{account.vbucks} currency</div>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/accounts/${account.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      className="flex-1 red-gradient"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedAccounts.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No accounts found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
