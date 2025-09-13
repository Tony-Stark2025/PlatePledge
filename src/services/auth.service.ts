import { Injectable, signal, inject } from '@angular/core';
import { User, UserRole, UserRegistration, UserLogin } from '../models/user.model';
import { StorageService } from './storage.service';

interface AuthError {
  type: 'validation' | 'authentication' | 'registration';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storageService = inject(StorageService);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<AuthError | null>(null);
  
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    // Try to load user from storage on initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = this.storageService.getItem<User>('currentUser');
    if (savedUser) {
      // Convert date strings back to Date objects
      const user: User = {
        ...savedUser,
        createdAt: new Date(savedUser.createdAt)
      };
      this._currentUser.set(user);
    }
  }

  private saveUserToStorage(user: User): void {
    this.storageService.setItem('currentUser', user);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    // Minimum 6 characters, at least one letter and one number
    return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  }

  async register(registration: UserRegistration): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Validation
      if (!registration.name.trim()) {
        throw new Error('Name is required');
      }

      if (!this.validateEmail(registration.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!this.validatePassword(registration.password)) {
        throw new Error('Password must be at least 6 characters with letters and numbers');
      }

      // Check if user already exists
      const existingUsers = this.storageService.getItem<User[]>('users') || [];
      if (existingUsers.some(user => user.email.toLowerCase() === registration.email.toLowerCase())) {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: registration.name.trim(),
        email: registration.email.toLowerCase(),
        role: registration.role,
        phone: registration.phone?.trim(),
        organization: registration.organization?.trim(),
        address: registration.address?.trim(),
        preferences: {
          notifications: true,
          maxDistance: 10,
          dietaryRestrictions: []
        },
        createdAt: new Date()
      };

      // Save user to users list
      const updatedUsers = [...existingUsers, newUser];
      this.storageService.setItem('users', updatedUsers);

      // Save password separately (in real app, this would be hashed on backend)
      const passwords = this.storageService.getItem<Record<string, string>>('passwords') || {};
      passwords[newUser.email] = registration.password;
      this.storageService.setItem('passwords', passwords);

      // Set as current user
      this._currentUser.set(newUser);
      this.saveUserToStorage(newUser);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      this._error.set({ type: 'registration', message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  async login(credentials: UserLogin): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Validation
      if (!this.validateEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!credentials.password) {
        throw new Error('Password is required');
      }

      // Find user
      const users = this.storageService.getItem<User[]>('users') || [];
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const passwords = this.storageService.getItem<Record<string, string>>('passwords') || {};
      if (passwords[user.email] !== credentials.password) {
        throw new Error('Invalid email or password');
      }

      // Set as current user
      this._currentUser.set(user);
      this.saveUserToStorage(user);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this._error.set({ type: 'authentication', message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  // Quick login for demo purposes (backwards compatibility)
  quickLogin(role: UserRole): void {
    const demoUser: User = {
      id: 'demo_' + role,
      name: role === 'donor' ? 'Demo Donor' : 'Demo Recipient',
      email: `demo.${role}@platepledge.com`,
      role: role,
      preferences: {
        notifications: true,
        maxDistance: 10,
        dietaryRestrictions: []
      },
      createdAt: new Date()
    };
    this._currentUser.set(demoUser);
    this.saveUserToStorage(demoUser);
  }

  logout(): void {
    this._currentUser.set(null);
    this._error.set(null);
    this.storageService.removeItem('currentUser');
  }

  clearError(): void {
    this._error.set(null);
  }

  updateProfile(updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>): void {
    const currentUser = this._currentUser();
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      ...updates
    };

    // Update in users list
    const users = this.storageService.getItem<User[]>('users') || [];
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? updatedUser : user
    );
    this.storageService.setItem('users', updatedUsers);

    // Update current user
    this._currentUser.set(updatedUser);
    this.saveUserToStorage(updatedUser);
  }
}
