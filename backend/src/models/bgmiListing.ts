import { z } from 'zod';

// BGMI Rank enum
export const BGMI_RANKS = [
  'Bronze V', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I',
  'Silver V', 'Silver IV', 'Silver III', 'Silver II', 'Silver I',
  'Gold V', 'Gold IV', 'Gold III', 'Gold II', 'Gold I',
  'Platinum V', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I',
  'Diamond V', 'Diamond IV', 'Diamond III', 'Diamond II', 'Diamond I',
  'Crown V', 'Crown IV', 'Crown III', 'Crown II', 'Crown I',
  'Ace', 'Ace Master', 'Ace Dominator', 'Conqueror'
] as const;

export type BGMI_RANK = typeof BGMI_RANKS[number];

// BGMI Listing Schema
export const createBGMIListingSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  price: z.number()
    .positive('Price must be greater than 0')
    .max(100000, 'Price must be less than ₹1,00,000'),
  rank: z.enum(BGMI_RANKS),
  level: z.number()
    .int('Level must be a whole number')
    .min(1, 'Level must be at least 1')
    .max(100, 'Level must be less than 100'),
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least 1 image is required')
    .max(10, 'Maximum 10 images allowed')
});

export const updateBGMIListingSchema = createBGMIListingSchema.partial();

export const bgmiListingQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 20),
  rank: z.enum(BGMI_RANKS).optional(),
  minPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt', 'level']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// BGMI Listing Interface
export interface BGMIListing {
  id: string;
  title: string;
  description: string;
  price: number;
  rank: BGMI_RANK;
  level: number;
  images: string[];
  sellerId: string; // Cognito sub
  sellerEmail: string;
  sellerUsername: string;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBGMIListingRequest {
  title: string;
  description: string;
  price: number;
  rank: BGMI_RANK;
  level: number;
  images: string[];
}

export interface UpdateBGMIListingRequest {
  title?: string;
  description?: string;
  price?: number;
  rank?: BGMI_RANK;
  level?: number;
  images?: string[];
}

export interface BGMIListingQuery {
  page: number;
  limit: number;
  rank?: BGMI_RANK;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy: 'price' | 'createdAt' | 'level';
  sortOrder: 'asc' | 'desc';
}
