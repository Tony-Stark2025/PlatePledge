import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserRole, UserRegistration, UserLogin } from '../../models/user.model';

type AuthMode = 'choice' | 'login' | 'register';

@Component({
  selector: 'app-login',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" (click)="closeModal.emit()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all p-8" (click)="$event.stopPropagation()">
        
        <!-- Choice Mode -->
        <div *ngIf="mode() === 'choice'" class="text-center">
          <div class="flex justify-center mb-4">
            <i class="ph-fill ph-plant text-6xl text-green-600"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-800">Join PlatePledge</h3>
          <p class="text-gray-500 mt-2 mb-8">Are you here to share or receive food?</p>
          
          <div class="space-y-4">
            <button (click)="selectRole('donor')" class="w-full flex items-center justify-center text-center p-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-300">
              <i class="ph-fill ph-heart-straight text-2xl mr-3"></i>
              <span class="font-semibold">I'm a Donor</span>
            </button>
            <button (click)="selectRole('recipient')" class="w-full flex items-center justify-center text-center p-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-300">
              <i class="ph-fill ph-hand-waving text-2xl mr-3"></i>
              <span class="font-semibold">I'm a Recipient</span>
            </button>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-4">Already have an account?</p>
            <button (click)="mode.set('login')" class="text-green-600 hover:text-green-700 font-medium">
              Sign In
            </button>
          </div>

          <button (click)="quickDemo()" class="mt-4 text-sm text-gray-500 hover:text-gray-700">
            Quick Demo (No Account)
          </button>
        </div>

        <!-- Login Mode -->
        <div *ngIf="mode() === 'login'">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Sign In</h3>
          
          <form (ngSubmit)="handleLogin()" #loginForm="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="loginData.email"
                required
                email
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="loginData.password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div *ngIf="authService.error() && authService.error()?.type === 'authentication'" 
                 class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {{ authService.error()?.message }}
            </div>

            <button
              type="submit"
              [disabled]="!loginForm.form.valid || authService.isLoading()"
              class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <span *ngIf="!authService.isLoading()">Sign In</span>
              <span *ngIf="authService.isLoading()" class="flex items-center justify-center">
                <i class="ph ph-spinner-gap animate-spin mr-2"></i>
                Signing in...
              </span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <button (click)="mode.set('choice')" class="text-gray-500 hover:text-gray-700 text-sm">
              ← Back
            </button>
            <span class="mx-2 text-gray-300">|</span>
            <button (click)="mode.set('register')" class="text-green-600 hover:text-green-700 text-sm">
              Create Account
            </button>
          </div>
        </div>

        <!-- Register Mode -->
        <div *ngIf="mode() === 'register'">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Create Account</h3>
          
          <form (ngSubmit)="handleRegister()" #registerForm="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="registerData.name"
                required
                minlength="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="registerData.email"
                required
                email
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="registerData.password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="At least 6 characters with letters & numbers"
              />
              <p class="text-xs text-gray-500 mt-1">At least 6 characters with letters and numbers</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="registerData.role = 'donor'"
                  [class]="registerData.role === 'donor' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-gray-50 border-gray-300 text-gray-700'"
                  class="p-3 border-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <i class="ph-fill ph-heart-straight text-xl mb-1"></i>
                  <div class="text-sm font-medium">Donor</div>
                </button>
                <button
                  type="button"
                  (click)="registerData.role = 'recipient'"
                  [class]="registerData.role === 'recipient' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-300 text-gray-700'"
                  class="p-3 border-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <i class="ph-fill ph-hand-waving text-xl mb-1"></i>
                  <div class="text-sm font-medium">Recipient</div>
                </button>
              </div>
            </div>

            <div *ngIf="registerData.role === 'donor'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Organization/Business Name</label>
              <input
                type="text"
                name="organization"
                [(ngModel)]="registerData.organization"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Restaurant, store, or business name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                [(ngModel)]="registerData.phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div *ngIf="authService.error() && authService.error()?.type === 'registration'" 
                 class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {{ authService.error()?.message }}
            </div>

            <button
              type="submit"
              [disabled]="!registerForm.form.valid || !registerData.role || authService.isLoading()"
              class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <span *ngIf="!authService.isLoading()">Create Account</span>
              <span *ngIf="authService.isLoading()" class="flex items-center justify-center">
                <i class="ph ph-spinner-gap animate-spin mr-2"></i>
                Creating account...
              </span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <button (click)="mode.set('choice')" class="text-gray-500 hover:text-gray-700 text-sm">
              ← Back
            </button>
            <span class="mx-2 text-gray-300">|</span>
            <button (click)="mode.set('login')" class="text-green-600 hover:text-green-700 text-sm">
              Sign In Instead
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button 
          (click)="closeModal.emit()" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <i class="ph ph-x text-xl"></i>
        </button>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  closeModal = output<void>();
  authService = inject(AuthService);

  mode = signal<AuthMode>('choice');
  selectedRole = signal<UserRole | null>(null);

  loginData: UserLogin = {
    email: '',
    password: ''
  };

  registerData: UserRegistration = {
    name: '',
    email: '',
    password: '',
    role: 'recipient',
    phone: '',
    organization: ''
  };

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.registerData.role = role;
    this.mode.set('register');
  }

  async handleLogin(): Promise<void> {
    this.authService.clearError();
    const result = await this.authService.login(this.loginData);
    if (result.success) {
      this.closeModal.emit();
    }
  }

  async handleRegister(): Promise<void> {
    this.authService.clearError();
    const result = await this.authService.register(this.registerData);
    if (result.success) {
      this.closeModal.emit();
    }
  }

  quickDemo(): void {
    // Show demo options
    this.mode.set('choice');
    // For now, just default to donor demo
    this.authService.quickLogin('donor');
    this.closeModal.emit();
  }
}
