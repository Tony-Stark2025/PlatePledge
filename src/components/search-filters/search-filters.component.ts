import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodListingService, ListingFilters } from '../../services/food-listing.service';
import { FoodCategory } from '../../models/food-listing.model';

@Component({
  selector: 'app-search-filters',
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <!-- Search Bar -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="updateSearch($event)"
            placeholder="Search by food type, description, or location..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <button
            *ngIf="searchTerm"
            (click)="clearSearch()"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i class="ph ph-x"></i>
          </button>
        </div>
      </div>

      <!-- Filters Toggle -->
      <div class="flex items-center justify-between mb-4">
        <button
          (click)="toggleFilters()"
          class="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <i class="ph ph-funnel mr-2"></i>
          Filters
          <i [class]="showFilters() ? 'ph ph-caret-up' : 'ph ph-caret-down'" class="ml-1"></i>
        </button>

        <div class="flex items-center text-sm text-gray-600">
          <span>{{ getTotalResults() }} results</span>
          <button
            *ngIf="hasActiveFilters()"
            (click)="clearAllFilters()"
            class="ml-3 text-green-600 hover:text-green-700"
          >
            Clear all
          </button>
        </div>
      </div>

      <!-- Filter Options -->
      <div *ngIf="showFilters()" class="space-y-4 border-t border-gray-200 pt-4">
        
        <!-- Food Categories -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Food Category</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              *ngFor="let category of foodCategories"
              (click)="toggleCategory(category.value)"
              [class]="selectedCategory() === category.value ? 
                'bg-green-100 border-green-500 text-green-800' : 
                'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'"
              class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {{ category.label }}
            </button>
          </div>
        </div>

        <!-- Dietary Preferences -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
          <div class="flex flex-wrap gap-2">
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="filters.vegetarian"
                (ngModelChange)="updateFilters()"
                class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span class="text-sm text-gray-700">Vegetarian</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="filters.vegan"
                (ngModelChange)="updateFilters()"
                class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span class="text-sm text-gray-700">Vegan</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="filters.glutenFree"
                (ngModelChange)="updateFilters()"
                class="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span class="text-sm text-gray-700">Gluten-Free</span>
            </label>
          </div>
        </div>

        <!-- Distance -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Maximum Distance: {{ filters.maxDistance || 'Any' }} 
            {{ filters.maxDistance ? (filters.maxDistance === 1 ? 'mile' : 'miles') : '' }}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            [(ngModel)]="filters.maxDistance"
            (ngModelChange)="updateFilters()"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 mile</span>
            <span>50 miles</span>
          </div>
          <button
            *ngIf="filters.maxDistance"
            (click)="clearDistance()"
            class="text-xs text-green-600 hover:text-green-700 mt-1"
          >
            Remove distance limit
          </button>
        </div>

        <!-- Listing Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let status of statusOptions"
              (click)="toggleStatus(status.value)"
              [class]="selectedStatus() === status.value ? 
                'bg-blue-100 border-blue-500 text-blue-800' : 
                'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'"
              class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

      </div>

      <!-- Active Filters Display -->
      <div *ngIf="hasActiveFilters() && !showFilters()" class="flex flex-wrap gap-2 mt-3">
        <span
          *ngIf="selectedCategory()"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          {{ getCategoryLabel(selectedCategory()!) }}
          <button (click)="clearCategory()" class="ml-1 text-green-600 hover:text-green-800">
            <i class="ph ph-x text-xs"></i>
          </button>
        </span>
        
        <span
          *ngIf="filters.vegetarian"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Vegetarian
          <button (click)="filters.vegetarian = false; updateFilters()" class="ml-1 text-blue-600 hover:text-blue-800">
            <i class="ph ph-x text-xs"></i>
          </button>
        </span>
        
        <span
          *ngIf="filters.vegan"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Vegan
          <button (click)="filters.vegan = false; updateFilters()" class="ml-1 text-blue-600 hover:text-blue-800">
            <i class="ph ph-x text-xs"></i>
          </button>
        </span>
        
        <span
          *ngIf="filters.glutenFree"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Gluten-Free
          <button (click)="filters.glutenFree = false; updateFilters()" class="ml-1 text-blue-600 hover:text-blue-800">
            <i class="ph ph-x text-xs"></i>
          </button>
        </span>
        
        <span
          *ngIf="filters.maxDistance"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
        >
          Within {{ filters.maxDistance }} {{ filters.maxDistance === 1 ? 'mile' : 'miles' }}
          <button (click)="clearDistance()" class="ml-1 text-purple-600 hover:text-purple-800">
            <i class="ph ph-x text-xs"></i>
          </button>
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class SearchFiltersComponent {
  private foodListingService = inject(FoodListingService);
  
  showFilters = signal(false);
  searchTerm = '';
  
  filters: ListingFilters = {
    vegetarian: false,
    vegan: false,
    glutenFree: false
  };

  selectedCategory = signal<FoodCategory | null>(null);
  selectedStatus = signal<string>('available');

  foodCategories = [
    { value: 'prepared-meals' as FoodCategory, label: 'Prepared Meals' },
    { value: 'bakery' as FoodCategory, label: 'Bakery' },
    { value: 'produce' as FoodCategory, label: 'Produce' },
    { value: 'dairy' as FoodCategory, label: 'Dairy' },
    { value: 'beverages' as FoodCategory, label: 'Beverages' },
    { value: 'pantry-items' as FoodCategory, label: 'Pantry Items' },
    { value: 'other' as FoodCategory, label: 'Other' }
  ];

  statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'expired', label: 'Expired' }
  ];

  constructor() {
    // Initialize with available status filter
    this.filters.status = 'available';
    this.updateFilters();
  }

  totalResults = this.foodListingService.listings;

  updateSearch(term: string): void {
    this.filters.searchTerm = term.trim() || undefined;
    this.updateFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filters.searchTerm = undefined;
    this.updateFilters();
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  getTotalResults(): number {
    return this.foodListingService.listings().length;
  }

  updateFilters(): void {
    const activeFilters: ListingFilters = {
      ...this.filters,
      category: this.selectedCategory() || undefined,
      status: this.selectedStatus() as any || undefined
    };
    
    // Remove false boolean values to avoid filtering out items
    if (!activeFilters.vegetarian) delete activeFilters.vegetarian;
    if (!activeFilters.vegan) delete activeFilters.vegan;
    if (!activeFilters.glutenFree) delete activeFilters.glutenFree;
    
    this.foodListingService.setFilters(activeFilters);
  }

  toggleCategory(category: FoodCategory): void {
    if (this.selectedCategory() === category) {
      this.selectedCategory.set(null);
    } else {
      this.selectedCategory.set(category);
    }
    this.updateFilters();
  }

  clearCategory(): void {
    this.selectedCategory.set(null);
    this.updateFilters();
  }

  toggleStatus(status: string): void {
    if (this.selectedStatus() === status) {
      this.selectedStatus.set('available'); // Default back to available
    } else {
      this.selectedStatus.set(status);
    }
    this.updateFilters();
  }

  clearDistance(): void {
    this.filters.maxDistance = undefined;
    this.updateFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.searchTerm ||
      this.selectedCategory() ||
      this.filters.vegetarian ||
      this.filters.vegan ||
      this.filters.glutenFree ||
      this.filters.maxDistance ||
      (this.selectedStatus() && this.selectedStatus() !== 'available')
    );
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCategory.set(null);
    this.selectedStatus.set('available');
    this.filters = {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      status: 'available'
    };
    this.updateFilters();
  }

  getCategoryLabel(category: FoodCategory): string {
    return this.foodCategories.find(c => c.value === category)?.label || category;
  }
}