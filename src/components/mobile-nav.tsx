"use client";

import * as React from "react";
import { Menu, X, Search, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search";

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function MobileNav({ isOpen, onToggle, onClose }: MobileNavProps) {
  const [searchValue, setSearchValue] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="md:hidden text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gray-900 border-l border-gray-700 shadow-2xl animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="h-6 w-6 text-red-500" />
                  <span className="text-lg font-bold text-white font-orbitron">
                    BGMI Marketplace
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-700">
                <SearchInput
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search BGMI accounts..."
                  className="w-full"
                />
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Search className="h-4 w-4 mr-3" />
                  Browse BGMI Accounts
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  <Gamepad2 className="h-4 w-4 mr-3" />
                  Sell BGMI Account
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  How it Works
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  Safety
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={onClose}
                >
                  Support
                </Button>
              </nav>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-700 space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-600 hover:bg-gray-800"
                  onClick={onClose}
                >
                  Log In
                </Button>
                <Button
                  className="w-full red-gradient"
                  onClick={onClose}
                >
                  Sell Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
