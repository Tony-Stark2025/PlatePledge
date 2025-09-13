import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  login(role: UserRole): void {
    // In a real app, this would involve a call to a backend authentication service.
    // Here we'll just create a mock user.
    const user: User = {
      name: role === 'donor' ? 'Generous Donor' : 'Grateful Recipient',
      role: role,
    };
    this._currentUser.set(user);
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
