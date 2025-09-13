
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodListingService } from './services/food-listing.service';
import { HeaderComponent } from './components/header/header.component';
import { FoodCardComponent } from './components/food-card/food-card.component';
import { AddListingComponent } from './components/add-listing/add-listing.component';
import { FoodListing } from './models/food-listing.model';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { LocationService } from './services/location.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, HeaderComponent, FoodCardComponent, AddListingComponent, LoginComponent],
})
export class AppComponent implements OnInit {
  foodListingService = inject(FoodListingService);
  authService = inject(AuthService);
  locationService = inject(LocationService);

  listings = this.foodListingService.listings;
  currentUser = this.authService.currentUser;
  
  isAddingListing = signal(false);
  isLoggingIn = signal(false);

  ngOnInit(): void {
    this.locationService.getUserLocation();
  }

  openAddListingModal(): void {
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

  // FIX: Updated the type of newListing to match the data emitted from the child component and expected by the service.
  handleListingAdded(newListing: Omit<FoodListing, 'id' | 'claimed' | 'latitude' | 'longitude'>): void {
    this.foodListingService.addListing(newListing);
    this.closeAddListingModal();
  }
}