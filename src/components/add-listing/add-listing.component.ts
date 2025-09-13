import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FoodListing } from '../../models/food-listing.model';
import { GeminiService, ParsedListing } from '../../services/gemini.service';

@Component({
  selector: 'app-add-listing',
  standalone: true, // Mark as standalone
  templateUrl: './add-listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class AddListingComponent {
  closeModal = output<void>();
  listingAdded = output<Omit<FoodListing, 'id' | 'claimed' | 'latitude' | 'longitude'>>();

  private geminiService = inject(GeminiService);
  
  aiIsThinking = signal(false);
  aiError = signal<string | null>(null);
  selectedImage = signal<string | null>(null);

  listingModel: Partial<FoodListing> = {
    donorName: '',
    foodType: '',
    description: '',
    quantity: '',
    pickupLocation: ''
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async generateWithAI(form: NgForm): Promise<void> {
    const description = form.value.description;
    if (!description || description.trim().length < 10) {
      this.aiError.set('Please provide a more detailed description.');
      return;
    }

    this.aiIsThinking.set(true);
    this.aiError.set(null);

    const parsedData = await this.geminiService.generateListingDetails(description);

    if (parsedData) {
      this.updateModel(parsedData, form);
    } else {
      this.aiError.set('Could not parse details. Please fill in the fields manually.');
    }

    this.aiIsThinking.set(false);
  }
  
  updateModel(parsedData: ParsedListing, form: NgForm) {
      form.controls['donorName']?.setValue(parsedData.donorName);
      form.controls['foodType']?.setValue(parsedData.foodType);
      form.controls['quantity']?.setValue(parsedData.quantity);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const newListing: Omit<FoodListing, 'id' | 'claimed' | 'latitude' | 'longitude'> = {
        donorName: form.value.donorName,
        foodType: form.value.foodType,
        description: form.value.description,
        quantity: form.value.quantity,
        pickupLocation: form.value.pickupLocation,
        imageUrl: this.selectedImage() || '', 
      };
      this.listingAdded.emit(newListing);
    }
  }
}
