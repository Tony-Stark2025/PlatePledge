import { Injectable, signal, computed, inject } from '@angular/core';
import { FoodListing, FoodCategory, ListingStatus, CreateListingRequest } from '../models/food-listing.model';
import { LocationService } from './location.service';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

const MOCK_LISTINGS: FoodListing[] = [
  {
    id: 1,
    donorId: 'demo_donor',
    donorName: "Slice of Heaven Pizzeria",
    foodType: "Pizza",
    category: 'prepared-meals',
    description: "10 large cheese and pepperoni pizzas left from tonight's service.",
    quantity: "10 pizzas",
    pickupLocation: "231 Bleecker St, New York, NY",
    latitude: 40.7309,
    longitude: -74.0027,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&h=300&fit=crop',
    claimed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    dietaryInfo: { vegetarian: true },
    status: 'available'
  },
  {
    id: 2,
    donorId: 'demo_donor',
    donorName: "The Daily Grind",
    foodType: "Coffee & Pastries",
    category: 'bakery',
    description: "Leftover drip coffee and a dozen assorted muffins and croissants.",
    quantity: "1 coffee urn, 12 pastries",
    pickupLocation: "1 Ferry Building, San Francisco, CA",
    latitude: 37.7955,
    longitude: -122.3937,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23eda2c5a5?q=80&w=400&h=300&fit=crop',
    claimed: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    dietaryInfo: { vegetarian: true },
    status: 'available'
  },
  {
    id: 3,
    donorId: 'demo_donor',
    donorName: "Healthy Harvest Market",
    foodType: "Organic Produce",
    category: 'produce',
    description: "Crates of organic apples, kale, and sweet potatoes. Perfect for healthy meals.",
    quantity: "3 large crates",
    pickupLocation: "151 N Michigan Ave, Chicago, IL",
    latitude: 41.8849,
    longitude: -87.6248,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=300&fit=crop',
    claimed: true,
    claimedBy: 'demo_recipient',
    claimedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    dietaryInfo: { vegetarian: true, vegan: true, glutenFree: true },
    status: 'claimed'
  },
  {
    id: 4,
    donorId: 'demo_donor',
    donorName: "Smoky's BBQ Joint",
    foodType: "Prepared BBQ Meals",
    category: 'prepared-meals',
    description: "Generous portions of brisket, pulled pork, and sides like coleslaw and potato salad.",
    quantity: "Around 8-10 meals",
    pickupLocation: "900 E 11th St, Austin, TX",
    latitude: 30.2687,
    longitude: -97.7314,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=400&h=300&fit=crop',
    claimed: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    dietaryInfo: { allergens: ['gluten'] },
    status: 'available'
  },
  {
    id: 5,
    donorId: 'demo_donor',
    donorName: "Ocean's Catch Sushi",
    foodType: "Sushi",
    category: 'prepared-meals',
    description: "Assorted sushi rolls, including California rolls and spicy tuna, made fresh today.",
    quantity: "5 large platters",
    pickupLocation: "1000 Pike St, Seattle, WA",
    latitude: 47.6145,
    longitude: -122.3303,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&h=300&fit=crop',
    claimed: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    dietaryInfo: { allergens: ['fish', 'soy'] },
    status: 'available'
  },
  {
    id: 6,
    donorId: 'demo_donor',
    donorName: "Tropical Smoothie Cafe",
    foodType: "Smoothies & Juices",
    category: 'beverages',
    description: "Freshly blended fruit smoothies and cold-pressed juices from our closing stock.",
    quantity: "About 15 various drinks",
    pickupLocation: "801 Ocean Dr, Miami Beach, FL",
    latitude: 25.7788,
    longitude: -80.1306,
    imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c53853?q=80&w=400&h=300&fit=crop',
    claimed: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    dietaryInfo: { vegetarian: true, vegan: true, glutenFree: true },
    status: 'available'
  }
];

export interface ListingFilters {
  searchTerm?: string;
  category?: FoodCategory;
  maxDistance?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  status?: ListingStatus;
}

@Injectable({
  providedIn: 'root',
})
export class FoodListingService {
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  
  private readonly _listings = signal<FoodListing[]>([]);
  private readonly _filters = signal<ListingFilters>({});
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  
  readonly filters = this._filters.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.loadListings();
  }

  private loadListings(): void {
    // Load listings from storage, fallback to mock data
    const savedListings = this.storageService.getItem<FoodListing[]>('listings');
    if (savedListings && savedListings.length > 0) {
      // Convert date strings back to Date objects
      const listings = savedListings.map(listing => ({
        ...listing,
        createdAt: new Date(listing.createdAt),
        expiresAt: new Date(listing.expiresAt),
        claimedAt: listing.claimedAt ? new Date(listing.claimedAt) : undefined
      }));
      this._listings.set(listings);
    } else {
      this._listings.set(MOCK_LISTINGS);
      this.saveListings();
    }
  }

  private saveListings(): void {
    this.storageService.setItem('listings', this._listings());
  }

  readonly listings = computed(() => {
    const userLocation = this.locationService.userLocation();
    const allListings = this._listings();
    const filters = this._filters();

    // Update expired listings
    const now = new Date();
    const updatedListings = allListings.map(listing => {
      if (listing.status === 'available' && new Date(listing.expiresAt) < now) {
        return { ...listing, status: 'expired' as ListingStatus };
      }
      return listing;
    });

    // Apply filters
    let filteredListings = updatedListings.filter(listing => {
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          listing.foodType.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term) ||
          listing.donorName.toLowerCase().includes(term) ||
          listing.pickupLocation.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && listing.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && listing.status !== filters.status) {
        return false;
      }

      // Dietary filters
      if (filters.vegetarian && !listing.dietaryInfo?.vegetarian) {
        return false;
      }
      if (filters.vegan && !listing.dietaryInfo?.vegan) {
        return false;
      }
      if (filters.glutenFree && !listing.dietaryInfo?.glutenFree) {
        return false;
      }

      return true;
    });

    // Add distance and sort
    if (userLocation) {
      const listingsWithDistance = filteredListings.map(listing => {
        const distance = this.locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          listing.latitude,
          listing.longitude
        );
        return { ...listing, distance };
      });

      // Apply distance filter
      if (filters.maxDistance) {
        filteredListings = listingsWithDistance.filter(
          listing => (listing.distance ?? Infinity) <= filters.maxDistance!
        );
      } else {
        filteredListings = listingsWithDistance;
      }

      // Sort by distance
      return filteredListings.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return filteredListings;
  });

  setFilters(filters: ListingFilters): void {
    this._filters.set(filters);
  }

  updateFilter(key: keyof ListingFilters, value: any): void {
    this._filters.update(current => ({ ...current, [key]: value }));
  }

  clearFilters(): void {
    this._filters.set({});
  }

  async addListing(request: CreateListingRequest): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser || currentUser.role !== 'donor') {
        throw new Error('Only donors can add listings');
      }

      const newId = Date.now();
      const userLocation = this.locationService.userLocation();
      const baseLat = userLocation?.latitude ?? 34.0522;
      const baseLng = userLocation?.longitude ?? -118.2437;

      const newListing: FoodListing = {
        id: newId,
        donorId: currentUser.id,
        donorName: currentUser.organization || currentUser.name,
        foodType: request.foodType.trim(),
        category: request.category,
        description: request.description.trim(),
        quantity: request.quantity.trim(),
        pickupLocation: request.pickupLocation.trim(),
        latitude: baseLat + (Math.random() - 0.5) * 0.1,
        longitude: baseLng + (Math.random() - 0.5) * 0.1,
        imageUrl: request.imageUrl || `https://picsum.photos/seed/${newId}/400/300`,
        claimed: false,
        createdAt: new Date(),
        expiresAt: request.expiresAt,
        dietaryInfo: request.dietaryInfo,
        status: 'available'
      };

      this._listings.update(listings => [newListing, ...listings]);
      this.saveListings();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add listing';
      this._error.set(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  claimListing(listingId: number): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'recipient') {
      this._error.set('Only recipients can claim listings');
      return;
    }

    this._listings.update(listings =>
      listings.map(listing =>
        listing.id === listingId
          ? {
              ...listing,
              claimed: true,
              claimedBy: currentUser.id,
              claimedAt: new Date(),
              status: 'claimed' as ListingStatus
            }
          : listing
      )
    );
    this.saveListings();
  }

  getListingById(id: number): FoodListing | undefined {
    return this._listings().find(listing => listing.id === id);
  }

  getMyListings(): FoodListing[] {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    if (currentUser.role === 'donor') {
      return this._listings().filter(listing => listing.donorId === currentUser.id);
    } else {
      return this._listings().filter(listing => listing.claimedBy === currentUser.id);
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}