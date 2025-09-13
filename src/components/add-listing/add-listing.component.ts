
import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateListingRequest, FoodCategory } from '../../models/food-listing.model';
import { FoodListingService } from '../../services/food-listing.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-add-listing',
  templateUrl: './add-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class AddListingComponent {
  closeModal = output<void>();
  listingAdded = output<void>();

  private geminiService = inject(GeminiService);
  private foodListingService = inject(FoodListingService);
  
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  selectedImage = signal<string | null>(null);

  foodCategories = [
    { value: 'prepared-meals' as FoodCategory, label: 'Prepared Meals' },
    { value: 'bakery' as FoodCategory, label: 'Bakery' },
    { value: 'produce' as FoodCategory, label: 'Produce' },
    { value: 'dairy' as FoodCategory, label: 'Dairy' },
    { value: 'beverages' as FoodCategory, label: 'Beverages' },
    { value: 'pantry-items' as FoodCategory, label: 'Pantry Items' },
    { value: 'other' as FoodCategory, label: 'Other' }
  ];

  listingData: CreateListingRequest = {
    foodType: '',
    category: 'prepared-meals',
    description: '',
    quantity: '',
    pickupLocation: '',
    expiresAt: this.getDefaultExpirationTime(),
    imageUrl: '',
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      allergens: []
    }
  };

  allergenInput = '';

  private getDefaultExpirationTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // Default to 6 PM tomorrow
    return tomorrow;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Image file must be smaller than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage.set(reader.result as string);
        this.listingData.imageUrl = reader.result as string;
        this.error.set(null);
      };
      reader.readAsDataURL(file);
    }
  }

  addAllergen(): void {
    const allergen = this.allergenInput.trim().toLowerCase();
    if (allergen && !this.listingData.dietaryInfo?.allergens?.includes(allergen)) {
      if (!this.listingData.dietaryInfo) {
        this.listingData.dietaryInfo = { allergens: [] };
      }
      if (!this.listingData.dietaryInfo.allergens) {
        this.listingData.dietaryInfo.allergens = [];
      }
      this.listingData.dietaryInfo.allergens.push(allergen);
      this.allergenInput = '';
    }
  }

  removeAllergen(allergen: string): void {
    if (this.listingData.dietaryInfo?.allergens) {
      this.listingData.dietaryInfo.allergens = this.listingData.dietaryInfo.allergens.filter(a => a !== allergen);
    }
  }

  formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onExpirationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.listingData.expiresAt = new Date(input.value);
    }
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (!form.valid) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate expiration time
    if (this.listingData.expiresAt <= new Date()) {
      this.error.set('Expiration time must be in the future');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      const result = await this.foodListingService.addListing(this.listingData);
      
      if (result.success) {
        this.listingAdded.emit();
        this.closeModal.emit();
      } else {
        this.error.set(result.error || 'Failed to create listing');
      }
    } catch (error) {
      this.error.set('An unexpected error occurred');
      console.error('Error creating listing:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel(): void {
    this.closeModal.emit();
  }
}