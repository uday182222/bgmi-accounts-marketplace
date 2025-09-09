"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        secondary: "border-transparent bg-gray-600 text-white hover:bg-gray-700",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-gray-300 border-gray-600",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        gaming: "border-transparent bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        fortnite: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
        league: "border-transparent bg-yellow-500 text-black hover:bg-yellow-600",
        valorant: "border-transparent bg-red-500 text-white hover:bg-red-600",
        roblox: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        discord: "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",
        cod: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
