import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodListing } from '../../models/food-listing.model';
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
    if (this.listing()) {
      this.foodListingService.claimListing(this.listing().id);
    }
  }
}