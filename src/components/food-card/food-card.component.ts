import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodListing, FoodCategory } from '../../models/food-listing.model';
import { NgOptimizedImage } from '@angular/common'
import { AuthService } from '../../services/auth.service';
import { FoodListingService } from '../../services/food-listing.service';

@Component({
  selector: 'app-food-card',
  templateUrl: './food-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgOptimizedImage],
})
export class FoodCardComponent {
  listing = input.required<FoodListing>();

  authService = inject(AuthService);
  foodListingService = inject(FoodListingService);
  currentUser = this.authService.currentUser;

  claimItem(): void {
    if (this.listing() && this.canClaim()) {
      this.foodListingService.claimListing(this.listing().id);
    }
  }

  canClaim(): boolean {
    const user = this.currentUser();
    const item = this.listing();
    return !!(user && user.role === 'recipient' && item.status === 'available');
  }

  getCategoryLabel(category: FoodCategory): string {
    const categoryMap: Record<FoodCategory, string> = {
      'prepared-meals': 'Prepared Meals',
      'bakery': 'Bakery',
      'produce': 'Produce',
      'dairy': 'Dairy',
      'beverages': 'Beverages',
      'pantry-items': 'Pantry Items',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  }

  getTimeUntilExpiration(expiresAt: Date): { label: string; urgent: boolean } | null {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 1) {
      return { label: `${diffMinutes}m left`, urgent: true };
    } else if (diffHours < 2) {
      return { label: `${diffHours}h ${diffMinutes}m left`, urgent: true };
    } else if (diffHours < 6) {
      return { label: `${diffHours}h left`, urgent: false };
    }
    
    return null;
  }

  formatExpirationTime(expiresAt: Date): string {
    const expiration = new Date(expiresAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const expirationDate = new Date(expiration.getFullYear(), expiration.getMonth(), expiration.getDate());
    
    const timeStr = expiration.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    if (expirationDate.getTime() === today.getTime()) {
      return `today at ${timeStr}`;
    } else if (expirationDate.getTime() === tomorrow.getTime()) {
      return `tomorrow at ${timeStr}`;
    } else {
      return expiration.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  }

  formatClaimedTime(claimedAt: Date): string {
    const claimed = new Date(claimedAt);
    const now = new Date();
    const diffMs = now.getTime() - claimed.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  }

  hasDietaryInfo(dietaryInfo: any): boolean {
    return !!(
      dietaryInfo.vegetarian ||
      dietaryInfo.vegan ||
      dietaryInfo.glutenFree ||
      (dietaryInfo.allergens && dietaryInfo.allergens.length > 0)
    );
  }

  getButtonText(item: FoodListing): string {
    const user = this.currentUser();
    
    switch (item.status) {
      case 'claimed':
        return 'Already Claimed';
      case 'expired':
        return 'Expired';
      case 'available':
        if (!user) {
          return 'Login to Claim';
        } else if (user.role !== 'recipient') {
          return 'Recipients Only';
        } else {
          return 'Claim Now';
        }
      default:
        return 'Unavailable';
    }
  }

  getButtonTooltip(item: FoodListing): string {
    const user = this.currentUser();
    
    if (item.status !== 'available') {
      return '';
    }
    
    if (!user) {
      return 'You need to login as a recipient to claim food';
    } else if (user.role !== 'recipient') {
      return 'Only recipients can claim food items';
    } else {
      return 'Click to claim this food item';
    }
  }
}