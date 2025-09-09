import { AppError } from '../middleware/errorHandler';
import { 
  BGMIListing, 
  CreateBGMIListingRequest, 
  UpdateBGMIListingRequest, 
  BGMIListingQuery 
} from '../models/bgmiListing';

// Mock database - In production, this would be a real database
const bgmiListings: BGMIListing[] = [];

export class BGMIListingService {
  async createListing(
    listingData: CreateBGMIListingRequest,
    sellerId: string,
    sellerEmail: string,
    sellerUsername: string
  ): Promise<BGMIListing> {
    try {
      console.log('🔧 Creating BGMI listing:', listingData.title);
      
      const newListing: BGMIListing = {
        id: `bgmi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...listingData,
        sellerId,
        sellerEmail,
        sellerUsername,
        status: 'pending', // New listings need admin verification
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      bgmiListings.push(newListing);
      
      console.log('✅ BGMI listing created successfully:', newListing.id);
      return newListing;
    } catch (error: any) {
      console.error('❌ Error creating BGMI listing:', error);
      throw new AppError('Failed to create BGMI listing', 500);
    }
  }

  async getListings(query: BGMIListingQuery): Promise<{
    listings: BGMIListing[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log('🔧 Fetching BGMI listings with query:', query);
      
      let filteredListings = [...bgmiListings];

      // Filter by status (only show active listings to buyers)
      filteredListings = filteredListings.filter(listing => listing.status === 'active');

      // Apply filters
      if (query.rank) {
        filteredListings = filteredListings.filter(listing => listing.rank === query.rank);
      }

      if (query.minPrice !== undefined) {
        filteredListings = filteredListings.filter(listing => listing.price >= query.minPrice!);
      }

      if (query.maxPrice !== undefined) {
        filteredListings = filteredListings.filter(listing => listing.price <= query.maxPrice!);
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredListings = filteredListings.filter(listing => 
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description.toLowerCase().includes(searchTerm)
        );
      }

      // Sort listings
      filteredListings.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (query.sortBy) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'level':
            aValue = a.level;
            bValue = b.level;
            break;
          case 'createdAt':
          default:
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
        }

        if (query.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Pagination
      const total = filteredListings.length;
      const totalPages = Math.ceil(total / query.limit);
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedListings = filteredListings.slice(startIndex, endIndex);

      console.log(`✅ Found ${total} BGMI listings, returning ${paginatedListings.length}`);
      
      return {
        listings: paginatedListings,
        total,
        page: query.page,
        totalPages
      };
    } catch (error: any) {
      console.error('❌ Error fetching BGMI listings:', error);
      throw new AppError('Failed to fetch BGMI listings', 500);
    }
  }

  async getListingById(id: string): Promise<BGMIListing | null> {
    try {
      console.log('🔧 Fetching BGMI listing by ID:', id);
      
      const listing = bgmiListings.find(l => l.id === id);
      
      if (!listing) {
        console.log('❌ BGMI listing not found:', id);
        return null;
      }

      console.log('✅ BGMI listing found:', listing.id);
      return listing;
    } catch (error: any) {
      console.error('❌ Error fetching BGMI listing:', error);
      throw new AppError('Failed to fetch BGMI listing', 500);
    }
  }

  async getUserListings(sellerId: string): Promise<BGMIListing[]> {
    try {
      console.log('🔧 Fetching user BGMI listings for seller:', sellerId);
      
      const userListings = bgmiListings.filter(listing => listing.sellerId === sellerId);
      
      console.log(`✅ Found ${userListings.length} listings for seller`);
      return userListings;
    } catch (error: any) {
      console.error('❌ Error fetching user BGMI listings:', error);
      throw new AppError('Failed to fetch user listings', 500);
    }
  }

  async updateListing(
    id: string,
    updateData: UpdateBGMIListingRequest,
    sellerId: string
  ): Promise<BGMIListing | null> {
    try {
      console.log('🔧 Updating BGMI listing:', id);
      
      const listingIndex = bgmiListings.findIndex(l => l.id === id && l.sellerId === sellerId);
      
      if (listingIndex === -1) {
        console.log('❌ BGMI listing not found or unauthorized:', id);
        return null;
      }

      const existingListing = bgmiListings[listingIndex];
      if (!existingListing) {
        console.log('❌ BGMI listing not found:', id);
        return null;
      }

      const updatedListing: BGMIListing = {
        id: existingListing.id,
        title: updateData.title ?? existingListing.title,
        description: updateData.description ?? existingListing.description,
        price: updateData.price ?? existingListing.price,
        rank: updateData.rank ?? existingListing.rank,
        level: updateData.level ?? existingListing.level,
        images: updateData.images ?? existingListing.images,
        sellerId: existingListing.sellerId,
        sellerEmail: existingListing.sellerEmail,
        sellerUsername: existingListing.sellerUsername,
        status: existingListing.status,
        isVerified: existingListing.isVerified,
        createdAt: existingListing.createdAt,
        updatedAt: new Date()
      };

      bgmiListings[listingIndex] = updatedListing;
      
      console.log('✅ BGMI listing updated successfully:', id);
      return updatedListing;
    } catch (error: any) {
      console.error('❌ Error updating BGMI listing:', error);
      throw new AppError('Failed to update BGMI listing', 500);
    }
  }

  async deleteListing(id: string, sellerId: string): Promise<boolean> {
    try {
      console.log('🔧 Deleting BGMI listing:', id);
      
      const listingIndex = bgmiListings.findIndex(l => l.id === id && l.sellerId === sellerId);
      
      if (listingIndex === -1) {
        console.log('❌ BGMI listing not found or unauthorized:', id);
        return false;
      }

      bgmiListings.splice(listingIndex, 1);
      
      console.log('✅ BGMI listing deleted successfully:', id);
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting BGMI listing:', error);
      throw new AppError('Failed to delete BGMI listing', 500);
    }
  }

  // Admin methods
  async getAllListingsForAdmin(): Promise<BGMIListing[]> {
    try {
      console.log('🔧 Fetching all BGMI listings for admin');
      return [...bgmiListings];
    } catch (error: any) {
      console.error('❌ Error fetching all BGMI listings:', error);
      throw new AppError('Failed to fetch all listings', 500);
    }
  }

  async updateListingStatus(
    id: string,
    status: 'active' | 'sold' | 'pending' | 'rejected',
    isVerified: boolean = false
  ): Promise<BGMIListing | null> {
    try {
      console.log('🔧 Updating BGMI listing status:', id, status);
      
      const listingIndex = bgmiListings.findIndex(l => l.id === id);
      
      if (listingIndex === -1) {
        console.log('❌ BGMI listing not found:', id);
        return null;
      }

      const existingListing = bgmiListings[listingIndex];
      if (!existingListing) {
        console.log('❌ BGMI listing not found:', id);
        return null;
      }

      const updatedListing: BGMIListing = {
        ...existingListing,
        status,
        isVerified,
        updatedAt: new Date()
      };

      bgmiListings[listingIndex] = updatedListing;
      
      console.log('✅ BGMI listing status updated successfully:', id);
      return updatedListing;
    } catch (error: any) {
      console.error('❌ Error updating BGMI listing status:', error);
      throw new AppError('Failed to update listing status', 500);
    }
  }
}

export const bgmiListingService = new BGMIListingService();
