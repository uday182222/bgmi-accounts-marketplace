"use client";

import * as React from "react";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  onFilterClick?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  showFilters = false,
  onFilterClick,
  onClear,
  loading = false,
}: SearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFilterClick}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <Filter className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {loading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        </div>
      )}
    </div>
  );
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SearchFilters({
  isOpen,
  onClose,
  children,
  className,
}: SearchFiltersProps) {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4",
      className
    )}>
      {children}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

interface SearchResultProps {
  children: React.ReactNode;
  className?: string;
}

export function SearchResults({ children, className }: SearchResultProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

interface SearchResultItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SearchResultItem({
  children,
  onClick,
  className,
}: SearchResultItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}
