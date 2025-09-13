import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FoodListingService } from '../../services/food-listing.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" (click)="closeModal.emit()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800">Profile</h3>
          <button (click)="closeModal.emit()" class="text-gray-400 hover:text-gray-600">
            <i class="ph ph-x text-2xl"></i>
          </button>
        </div>

        @if (currentUser(); as user) {
          <div class="p-6 space-y-6">
            
            <!-- User Info -->
            <div class="text-center">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="ph-fill ph-user text-3xl text-green-600"></i>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">{{ user.name }}</h4>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
              <span [class]="user.role === 'donor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2">
                {{ user.role === 'donor' ? 'Food Donor' : 'Food Recipient' }}
              </span>
            </div>

            <!-- Edit Mode Toggle -->
            <div class="text-center">
              <button 
                (click)="toggleEditMode()"
                class="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {{ isEditing() ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>

            @if (isEditing()) {
              <!-- Edit Form -->
              <form (ngSubmit)="saveProfile()" #profileForm="ngForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editData.name"
                    name="name"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </div>

                @if (user.role === 'donor') {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Organization/Business</label>
                    <input 
                      type="text" 
                      [(ngModel)]="editData.organization"
                      name="organization"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                  </div>
                }

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="editData.phone"
                    name="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editData.address"
                    name="address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    (click)="cancelEdit()"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            } @else {
              <!-- View Mode -->
              <div class="space-y-4">
                @if (user.organization) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Organization</label>
                    <p class="text-sm text-gray-900 mt-1">{{ user.organization }}</p>
                  </div>
                }

                @if (user.phone) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Phone</label>
                    <p class="text-sm text-gray-900 mt-1">{{ user.phone }}</p>
                  </div>
                }

                @if (user.address) {
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Address</label>
                    <p class="text-sm text-gray-900 mt-1">{{ user.address }}</p>
                  </div>
                }

                <div>
                  <label class="block text-sm font-medium text-gray-700">Member Since</label>
                  <p class="text-sm text-gray-900 mt-1">{{ formatDate(user.createdAt) }}</p>
                </div>
              </div>

              <!-- My Listings -->
              <div class="border-t border-gray-200 pt-6">
                <h5 class="text-sm font-medium text-gray-700 mb-3">
                  {{ user.role === 'donor' ? 'My Listings' : 'My Claims' }}
                </h5>
                
                @if (myListings().length > 0) {
                  <div class="space-y-2">
                    @for (listing of myListings(); track listing.id) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-start">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ listing.foodType }}</p>
                            <p class="text-xs text-gray-500">{{ listing.quantity }}</p>
                          </div>
                          <span [class]="getStatusClass(listing.status)" 
                                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                            {{ getStatusLabel(listing.status) }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-sm text-gray-500">
                    {{ user.role === 'donor' ? 'No listings yet' : 'No claims yet' }}
                  </p>
                }
              </div>

              <!-- Logout Button -->
              <div class="border-t border-gray-200 pt-6">
                <button 
                  (click)="logout()"
                  class="w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <i class="ph ph-sign-out mr-2"></i>
                  Sign Out
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class UserProfileComponent {
  closeModal = output<void>();
  
  private authService = inject(AuthService);
  private foodListingService = inject(FoodListingService);
  
  currentUser = this.authService.currentUser;
  isEditing = signal(false);
  
  editData: Partial<User> = {};

  myListings = signal(this.foodListingService.getMyListings());

  toggleEditMode(): void {
    if (this.isEditing()) {
      this.cancelEdit();
    } else {
      const user = this.currentUser();
      if (user) {
        this.editData = {
          name: user.name,
          phone: user.phone,
          organization: user.organization,
          address: user.address
        };
      }
      this.isEditing.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editData = {};
  }

  saveProfile(): void {
    this.authService.updateProfile(this.editData);
    this.isEditing.set(false);
    this.editData = {};
  }

  logout(): void {
    this.authService.logout();
    this.closeModal.emit();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString([], { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'claimed':
        return 'Claimed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  }
}