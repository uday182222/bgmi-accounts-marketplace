"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function Dropdown({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  React.useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-between",
          triggerClassName
        )}
      >
        <span className={cn(
          selectedOption ? "text-white" : "text-gray-400"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg",
          contentClassName
        )}>
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between",
                  "hover:bg-gray-700 focus:bg-gray-700 focus:outline-none",
                  option.disabled && "opacity-50 cursor-not-allowed",
                  selectedValue === option.value && "bg-gray-700"
                )}
              >
                <span className={cn(
                  selectedValue === option.value ? "text-white" : "text-gray-300"
                )}>
                  {option.label}
                </span>
                {selectedValue === option.value && (
                  <Check className="h-4 w-4 text-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  return (
    <div className={cn(
      "absolute top-full left-0 z-50 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg",
      className
    )}>
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  className,
}: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-gray-700 focus:bg-gray-700 focus:outline-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
