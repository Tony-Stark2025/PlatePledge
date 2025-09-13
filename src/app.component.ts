
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodListingService } from './services/food-listing.service';
import { HeaderComponent } from './components/header/header.component';
import { FoodCardComponent } from './components/food-card/food-card.component';
import { AddListingComponent } from './components/add-listing/add-listing.component';
import { SearchFiltersComponent } from './components/search-filters/search-filters.component';
import { LoginComponent } from './components/login/login.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthService } from './services/auth.service';
import { LocationService } from './services/location.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, FoodCardComponent, AddListingComponent, SearchFiltersComponent, LoginComponent, UserProfileComponent],
})
export class AppComponent implements OnInit {
  foodListingService = inject(FoodListingService);
  authService = inject(AuthService);
  locationService = inject(LocationService);

  listings = this.foodListingService.listings;
  currentUser = this.authService.currentUser;
  isLoading = this.foodListingService.isLoading;
  error = this.foodListingService.error;
  
  isAddingListing = signal(false);
  isLoggingIn = signal(false);
  showProfile = signal(false);

  ngOnInit(): void {
    this.locationService.getUserLocation();
  }

  openAddListingModal(): void {
    const user = this.currentUser();
    if (!user) {
      this.openLoginModal();
      return;
    }
    
    if (user.role !== 'donor') {
      // Show error or redirect - only donors can add listings
      return;
    }
    
    this.isAddingListing.set(true);
  }

  closeAddListingModal(): void {
    this.isAddingListing.set(false);
  }

  openLoginModal(): void {
    this.isLoggingIn.set(true);
  }

  closeLoginModal(): void {
    this.isLoggingIn.set(false);
  }

  openProfileModal(): void {
    this.showProfile.set(true);
  }

  closeProfileModal(): void {
    this.showProfile.set(false);
  }

  handleListingAdded(): void {
    this.closeAddListingModal();
    // Optional: Show success message
  }

  clearError(): void {
    this.foodListingService.clearError();
  }
}