"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/components/ui/toast";
import { 
  Gamepad2,
  Star,
  Shield,
  DollarSign,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  User
} from "lucide-react";
import Link from "next/link";

// Mock data - in a real app, this would come from an API
const mockAccount = {
  id: 1,
  game: "Fortnite",
  title: "Epic Fortnite Account - Battle Pass Complete",
  price: 299,
  originalPrice: 399,
  images: [
    "/api/placeholder/600/400",
    "/api/placeholder/600/400",
    "/api/placeholder/600/400"
  ],
  rating: 4.8,
  reviews: 124,
  level: 150,
  skins: 45,
  vbucks: 2000,
  description: "Complete battle pass with all skins, emotes, and pickaxes. Rare items included. This account has been carefully maintained and includes all seasonal rewards from Chapter 2 Season 1 onwards.",
  seller: {
    username: "ProGamer123",
    verified: true,
    rating: 4.9,
    totalSales: 234,
    memberSince: "2022-01-15"
  },
  createdAt: "2 days ago",
  tags: ["Battle Pass", "Rare Skins", "High Level", "V-Bucks", "Complete"],
  features: [
    "Complete Battle Pass Season 4",
    "45+ Rare Skins",
    "2000 V-Bucks",
    "All Emotes Unlocked",
    "Rare Pickaxes",
    "Gliders Collection"
  ],
  stats: {
    playtime: "500+ hours",
    wins: 234,
    kills: 5678,
    kd: 2.4
  }
};

export default function AccountDetailPage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToast } = useToast();

  const handleMobileNavToggle = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleMobileNavClose = () => {
    setIsMobileNavOpen(false);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    addToast({
      type: 'success',
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Account removed from your favorites" : "Account added to your favorites"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockAccount.title,
        text: mockAccount.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: 'success',
        title: "Link copied",
        description: "Account link copied to clipboard"
      });
    }
  };

  const handleBuyNow = () => {
    addToast({
      type: 'success',
      title: "Redirecting to checkout",
      description: "You will be redirected to the secure checkout page"
    });
  };

  const handleContactSeller = () => {
    setShowContactModal(true);
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
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
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
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/accounts"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in-left">
            {/* Image Gallery */}
            <Card className="bg-gray-900/50 border-gray-700 animate-scale-in">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Gamepad2 className="h-24 w-24 text-gray-600" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="default">
                      {mockAccount.game}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleFavorite}
                      className="h-10 w-10 bg-black/50 hover:bg-black/70"
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          isFavorite 
                            ? "text-red-500 fill-red-500" 
                            : "text-white"
                        }`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                      className="h-10 w-10 bg-black/50 hover:bg-black/70"
                    >
                      <Share2 className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                  {mockAccount.originalPrice > mockAccount.price && (
                    <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                      {Math.round((1 - mockAccount.price / mockAccount.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {mockAccount.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        currentImageIndex === index 
                          ? "border-red-500" 
                          : "border-gray-600"
                      }`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="bg-gray-900/50 border-gray-700 animate-move-in-up animate-stagger-1">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-white mb-4">
                  {mockAccount.title}
                </h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {mockAccount.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {mockAccount.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">What&apos;s Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mockAccount.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Account Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockAccount.stats.playtime}</div>
                      <div className="text-sm text-gray-400">Playtime</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockAccount.stats.wins}</div>
                      <div className="text-sm text-gray-400">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockAccount.stats.kills}</div>
                      <div className="text-sm text-gray-400">Kills</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockAccount.stats.kd}</div>
                      <div className="text-sm text-gray-400">K/D Ratio</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase and Seller Info */}
          <div className="space-y-6 animate-slide-in-right">
            {/* Purchase Card */}
            <Card className="bg-gray-900/50 border-gray-700 sticky top-24 animate-scale-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white">
                      ${mockAccount.price}
                    </span>
                    {mockAccount.originalPrice > mockAccount.price && (
                      <span className="text-xl text-gray-400 line-through">
                        ${mockAccount.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>Level {mockAccount.level}</div>
                    <div>{mockAccount.skins} skins</div>
                    {mockAccount.vbucks > 0 && <div>{mockAccount.vbucks} V-Bucks</div>}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <Button 
                    onClick={handleBuyNow}
                    className="w-full red-gradient text-lg py-3"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleContactSeller}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {mockAccount.rating} ({mockAccount.reviews} reviews)
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Listed</span>
                    <span>{mockAccount.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Security</span>
                    <div className="flex items-center text-green-400">
                      <Shield className="h-4 w-4 mr-1" />
                      Protected
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="bg-gray-900/50 border-gray-700 animate-move-in-up animate-stagger-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{mockAccount.seller.username}</span>
                      {mockAccount.seller.verified && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Member since {new Date(mockAccount.seller.memberSince).getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {mockAccount.seller.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Sales</span>
                    <span className="text-white">{mockAccount.seller.totalSales}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Contact Seller Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Seller"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Send a message to {mockAccount.seller.username} about this account.
          </p>
          <textarea
            className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
            placeholder="Type your message here..."
          />
          <div className="flex gap-3">
            <Button
              onClick={() => setShowContactModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowContactModal(false);
                addToast({
                  type: 'success',
                  title: "Message sent",
                  description: "Your message has been sent to the seller"
                });
              }}
              className="flex-1 red-gradient"
            >
              Send Message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
