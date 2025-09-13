
export interface FoodListing {
  id: number;
  donorId: string; // Reference to user ID
  donorName: string;
  foodType: string;
  category: FoodCategory;
  description: string;
  quantity: string;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  claimed: boolean;
  claimedBy?: string; // User ID of who claimed it
  claimedAt?: Date;
  createdAt: Date;
  expiresAt: Date; // When the food expires or pickup deadline
  distance?: number;
  dietaryInfo?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    allergens?: string[];
  };
  status: ListingStatus;
}

export type FoodCategory = 
  | 'prepared-meals' 
  | 'bakery' 
  | 'produce' 
  | 'dairy' 
  | 'beverages' 
  | 'pantry-items' 
  | 'other';

export type ListingStatus = 
  | 'available' 
  | 'pending' 
  | 'claimed' 
  | 'expired' 
  | 'cancelled';

export interface CreateListingRequest {
  foodType: string;
  category: FoodCategory;
  description: string;
  quantity: string;
  pickupLocation: string;
  expiresAt: Date;
  imageUrl?: string;
  dietaryInfo?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    allergens?: string[];
  };
}