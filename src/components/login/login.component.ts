import { Component, ChangeDetectionStrategy, output, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" (click)="closeModal.emit()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all p-8 text-center" (click)="$event.stopPropagation()">
        
        <div class="flex justify-center mb-4">
           <i class="ph-fill ph-plant text-6xl text-green-600"></i>
        </div>

        @if (role) {
          <h3 class="text-2xl font-bold text-gray-800">Log In as a {{ role === 'donor' ? 'Donor' : 'Recipient' }}</h3>
          <p class="text-gray-500 mt-2 mb-8">Confirm to continue your journey with PlatePledge.</p>
          <button (click)="loginAs(role)" 
                  [ngClass]="{
                    'bg-green-100 text-green-800 hover:bg-green-200': role === 'donor',
                    'bg-blue-100 text-blue-800 hover:bg-blue-200': role === 'recipient'
                  }"
                  class="w-full flex items-center justify-center text-center p-4 rounded-lg transition-colors duration-300">
              <i [ngClass]="role === 'donor' ? 'ph-fill ph-heart-straight' : 'ph-fill ph-hand-waving'" class="text-2xl mr-3"></i>
              <span class="font-semibold">Confirm and Log In</span>
          </button>
        } @else {
          <h3 class="text-2xl font-bold text-gray-800">Join PlatePledge</h3>
          <p class="text-gray-500 mt-2 mb-8">Are you here to share or receive?</p>
          <div class="space-y-4">
             <button (click)="loginAs('donor')" class="w-full flex items-center justify-center text-center p-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-300">
                  <i class="ph-fill ph-heart-straight text-2xl mr-3"></i>
                  <span class="font-semibold">I'm a Donor</span>
              </button>
              <button (click)="loginAs('recipient')" class="w-full flex items-center justify-center text-center p-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors duration-300">
                  <i class="ph-fill ph-hand-waving text-2xl mr-3"></i>
                  <span class="font-semibold">I'm a Recipient</span>
              </button>
          </div>
        }

        <button (click)="closeModal.emit()" class="mt-8 text-sm text-gray-500 hover:text-gray-700">
            Continue as Guest
        </button>

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  @Input() role: UserRole | null = null;
  closeModal = output<void>();
  private authService = inject(AuthService);

  loginAs(role: UserRole): void {
    this.authService.login(role);
    this.closeModal.emit();
  }
}
