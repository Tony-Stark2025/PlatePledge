import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FoodListingService } from './services/food-listing.service';
import { HeaderComponent } from './components/header/header.component';
import { FoodCardComponent } from './components/food-card/food-card.component';
import { AddListingComponent } from './components/add-listing/add-listing.component';
import { FoodListing } from './models/food-listing.model';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { LocationService } from './services/location.service';
import { OnboardingComponent } from './components/onboarding/onboarding.component'; // Import OnboardingComponent

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    FoodCardComponent,
    AddListingComponent,
    LoginComponent,
    OnboardingComponent, // Add OnboardingComponent to imports
  ],
})
export class AppComponent implements OnInit {
  foodListingService = inject(FoodListingService);
  authService = inject(AuthService);
  locationService = inject(LocationService);

  listings = this.foodListingService.listings;
  currentUser = this.authService.currentUser;

  isAddingListing = signal(false);
  isLoggingIn = signal(false);
  showOnboarding = signal(true); // Show onboarding by default
  userRole = signal<'donor' | 'recipient' | null>(null); // To store the user's choice

  ngOnInit(): void {
    this.locationService.getUserLocation();
    if (this.currentUser()) {
      this.showOnboarding.set(false);
    }
  }

  handleShare(): void {
    this.userRole.set('donor');
    this.showOnboarding.set(false);
    this.isLoggingIn.set(true);
  }

  handleReceive(): void {
    this.userRole.set('recipient');
    this.showOnboarding.set(false);
    // For recipients, we can show the listings right away
    // and prompt them to log in when they want to claim something.
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

  handleListingAdded(newListing: Omit<FoodListing, 'id' | 'claimed' | 'latitude' | 'longitude'>): void {
    this.foodListingService.addListing(newListing);
    this.closeAddListingModal();
  }
}
