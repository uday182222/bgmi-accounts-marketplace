"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search";
import { MobileNav } from "@/components/mobile-nav";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { 
  Shield, 
  Star, 
  Users, 
  TrendingUp,
  Gamepad2,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  Clock,
  DollarSign,
  Sparkles,
  Target,
  Lock
} from "lucide-react";

// BGMI-only marketplace - no multi-game support needed

const trustIndicators = [
  { icon: Users, text: "10,000+ Safe Transactions", value: "10,000+", color: "text-blue-400" },
  { icon: Shield, text: "24/7 Secure Escrow", value: "24/7", color: "text-green-400" },
  { icon: CheckCircle, text: "Verified Accounts Only", value: "100%", color: "text-purple-400" },
  { icon: Star, text: "Money-Back Guarantee", value: "100%", color: "text-yellow-400" }
];

const features = [
  {
    icon: Lock,
    title: "Secure Escrow",
    description: "Your funds are protected until delivery is confirmed"
  },
  {
    icon: Award,
    title: "Verified Sellers",
    description: "All sellers go through strict verification process"
  },
  {
    icon: Clock,
    title: "Instant Delivery",
    description: "Get your account details within minutes"
  },
  {
    icon: Target,
    title: "Quality Guarantee",
    description: "100% satisfaction or your money back"
  }
];

const heroImages = [
  {
    src: "/hero-image.png",
    alt: "Gaming Marketplace Hero"
  },
  {
    src: "/hero-image-2.png",
    alt: "Gaming Marketplace Hero 2"
  }
];

export default function HomePage() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-white font-orbitron">
                BGMI Marketplace
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search BGMI accounts..."
                className="w-full"
                showFilters
              />
            </div>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/marketplace">
                <Button variant="outline" size="sm">
                  Browse BGMI Accounts
                </Button>
              </Link>
              <Link href="/list-account">
                <Button variant="default" size="sm" className="red-gradient">
                  Sell BGMI Account
                </Button>
              </Link>
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <ImageCarousel
            images={heroImages}
            autoPlay={true}
            autoPlayInterval={4000}
            showDots={true}
            showArrows={true}
            className="w-full h-full"
          />
        </div>
        
        {/* Floating Action Button */}
        <div className="absolute bottom-8 right-8 z-30">
          <Link href="/marketplace">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl hover:shadow-glow rounded-full px-8 py-4 text-lg font-semibold group hover:scale-110 transition-all duration-300 floating"
            >
              <Gamepad2 className="h-6 w-6 mr-3 group-hover:animate-pulse" />
              Browse BGMI Accounts
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-orbitron">
              Why BGMI Players Trust Us
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built for BGMI players, by BGMI players. Experience the safest and most reliable BGMI account trading platform.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className={`text-center group animate-move-in-up animate-stagger-${index + 1}`}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-full mb-6 animate-scale-in group-hover:scale-110 transition-transform duration-300">
                  <indicator.icon className={`h-10 w-10 ${indicator.color}`} />
                </div>
                <div className="text-4xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-blue-400 transition-all duration-300">
                  {indicator.value}
                </div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {indicator.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron">
              Why Choose BGMI Marketplace?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of BGMI account trading with our advanced features and security measures.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group animate-move-in-up animate-stagger-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-blue-400 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BGMI Spotlight */}
      <section className="py-20 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                BGMI
              </span>
              <span className="text-white"> Marketplace</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The ultimate destination for Battlegrounds Mobile India account trading
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl border border-orange-500/20 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">BGMI Accounts</h3>
                      <p className="text-orange-400 font-medium">Premium & Verified</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Instant delivery within minutes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">100% secure escrow protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-gray-300">4.9/5 rating from 1,500+ users</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">1,500+</div>
                      <div className="text-gray-400">Active Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">$20-$200</div>
                      <div className="text-gray-400">Price Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">24/7</div>
                      <div className="text-gray-400">Support</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-8 border border-orange-500/30">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                      BGMI
                    </div>
                    <p className="text-gray-300 mb-6">
                      Battlegrounds Mobile India
                    </p>
                    <Link href="/marketplace">
                      <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg font-semibold">
                        <Gamepad2 className="h-5 w-5 mr-2" />
                        Browse BGMI Accounts
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/ready-to-start-bg.png"
            alt="Ready to Start Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 font-orbitron animate-slide-in-top">
              Ready to Start
              <span className="block text-white">
                Trading?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in animate-stagger-1">
              Join over 50,000 BGMI players who trust our marketplace for secure, instant, and reliable account trading
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-move-in-up animate-stagger-2 mb-12">
              <Link href="/signup">
                <Button size="xl" className="red-gradient pulse-glow text-lg px-10 py-5 group hover:scale-105 transition-all duration-300">
                  <Zap className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                  Get Started Free
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="xl" className="text-lg px-10 py-5 border-2 border-white/30 text-white hover:bg-white hover:text-black group transition-all duration-300">
                  <Gamepad2 className="h-6 w-6 mr-3" />
                  Browse BGMI Accounts
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in animate-stagger-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">$2M+</div>
                <div className="text-gray-400">Traded Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">4.9★</div>
                <div className="text-gray-400">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black via-gray-900 to-black py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,51,51,0.05),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="relative">
                  <Gamepad2 className="h-8 w-8 text-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-2xl font-bold text-white font-orbitron">
                  BGMI Marketplace
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The most trusted marketplace for BGMI account trading. Secure, fast, and reliable.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer">
                  <span className="text-white font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <span className="text-white font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer">
                  <span className="text-white font-bold">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  How it Works
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Safety & Security
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Pricing
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Documentation
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Help Center
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  System Status
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Report Issue
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-6 text-lg">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Terms of Service
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Privacy Policy
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Cookie Policy
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300 flex items-center group">
                  <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Refund Policy
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 GameSwap. All rights reserved. Made with ❤️ for gamers.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  All systems operational
                </span>
                <span>Version 2.0.1</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}