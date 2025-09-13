import { Injectable, signal, computed, inject } from '@angular/core';
import { FoodListing } from '../models/food-listing.model';
import { LocationService } from './location.service';

const MOCK_LISTINGS: FoodListing[] = [
  {
    id: 1,
    donorName: "Slice of Heaven Pizzeria",
    foodType: "Pizza",
    description: "10 large cheese and pepperoni pizzas left from tonight's service.",
    quantity: "10 pizzas",
    pickupLocation: "231 Bleecker St, New York, NY",
    latitude: 40.7309,
    longitude: -74.0027,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&h=300&fit=crop',
    claimed: false,
  },
  {
    id: 2,
    donorName: "The Daily Grind",
    foodType: "Coffee & Pastries",
    description: "Leftover drip coffee and a dozen assorted muffins and croissants.",
    quantity: "1 coffee urn, 12 pastries",
    pickupLocation: "1 Ferry Building, San Francisco, CA",
    latitude: 37.7955,
    longitude: -122.3937,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23eda2c5a5?q=80&w=400&h=300&fit=crop',
    claimed: false,
  },
  {
    id: 3,
    donorName: "Healthy Harvest Market",
    foodType: "Organic Produce",
    description: "Crates of organic apples, kale, and sweet potatoes. Perfect for healthy meals.",
    quantity: "3 large crates",
    pickupLocation: "151 N Michigan Ave, Chicago, IL",
    latitude: 41.8849,
    longitude: -87.6248,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=300&fit=crop',
    claimed: true,
  },
  {
    id: 4,
    donorName: "Smoky's BBQ Joint",
    foodType: "Prepared BBQ Meals",
    description: "Generous portions of brisket, pulled pork, and sides like coleslaw and potato salad.",
    quantity: "Around 8-10 meals",
    pickupLocation: "900 E 11th St, Austin, TX",
    latitude: 30.2687,
    longitude: -97.7314,
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=400&h=300&fit=crop',
    claimed: false,
  },
  {
    id: 5,
    donorName: "Ocean's Catch Sushi",
    foodType: "Sushi",
    description: "Assorted sushi rolls, including California rolls and spicy tuna, made fresh today.",
    quantity: "5 large platters",
    pickupLocation: "1000 Pike St, Seattle, WA",
    latitude: 47.6145,
    longitude: -122.3303,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&h=300&fit=crop',
    claimed: false,
  },
  {
    id: 6,
    donorName: "Tropical Smoothie Cafe",
    foodType: "Smoothies & Juices",
    description: "Freshly blended fruit smoothies and cold-pressed juices from our closing stock.",
    quantity: "About 15 various drinks",
    pickupLocation: "801 Ocean Dr, Miami Beach, FL",
    latitude: 25.7788,
    longitude: -80.1306,
    imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c53853?q=80&w=400&h=300&fit=crop',
    claimed: false,
  }
];

@Injectable({
  providedIn: 'root',
})
export class FoodListingService {
  private locationService = inject(LocationService);
  private readonly _listings = signal<FoodListing[]>(MOCK_LISTINGS);
  
  readonly listings = computed(() => {
    const userLocation = this.locationService.userLocation();
    const allListings = this._listings();

    if (!userLocation) {
      return allListings;
    }

    const listingsWithDistance = allListings.map(listing => {
      const distance = this.locationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        listing.latitude,
        listing.longitude
      );
      return { ...listing, distance };
    });

    return listingsWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  });

  addListing(listing: Omit<FoodListing, 'id' | 'claimed' | 'latitude' | 'longitude'>): void {
    const newId = Date.now();
    // In a real app, you'd use a geocoding service to get lat/lng from the address.
    // For this demo, we'll assign random nearby coordinates based on user's location if available.
    const userLocation = this.locationService.userLocation();
    const baseLat = userLocation?.latitude ?? 34.0522;
    const baseLng = userLocation?.longitude ?? -118.2437;

    const newListing: FoodListing = { 
      ...listing, 
      id: newId, 
      claimed: false,
      latitude: baseLat + (Math.random() - 0.5) * 0.1,
      longitude: baseLng + (Math.random() - 0.5) * 0.1,
      imageUrl: listing.imageUrl || `https://picsum.photos/seed/${newId}/400/300` 
    };
    this._listings.update((listings) => [
      newListing,
      ...listings
    ]);
  }

  claimListing(listingId: number): void {
    this._listings.update(listings => 
      listings.map(listing => 
        listing.id === listingId ? { ...listing, claimed: true } : listing
      )
    );
  }
}