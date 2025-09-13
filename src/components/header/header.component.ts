import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  template: `
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <i class="ph-fill ph-plant text-4xl text-green-600"></i>
            <span class="text-2xl font-bold text-gray-800">PlatePledge</span>
          </div>
          <div class="flex items-center space-x-4">
            @if (currentUser(); as user) {
              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                  <i [class]="user.role === 'donor' ? 'ph-fill ph-heart-straight' : 'ph-fill ph-hand-waving'" class="text-xl text-green-600"></i>
                  <div class="text-sm">
                    <p class="font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500 capitalize">{{ user.role }}</p>
                  </div>
                </div>
                
                <!-- Profile dropdown -->
                <button 
                  (click)="profileRequest.emit()"
                  class="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  title="View Profile"
                >
                  <i class="ph ph-user-circle text-2xl text-gray-600"></i>
                </button>
              </div>
            } @else {
              <button (click)="loginRequest.emit()" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Login / Register
              </button>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  loginRequest = output<void>();
  profileRequest = output<void>();
}