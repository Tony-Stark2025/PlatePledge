
export interface FoodListing {
  id: number;
  donorName: string;
  foodType: string;
  description: string;
  quantity: string;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  claimed: boolean;
  distance?: number;
}