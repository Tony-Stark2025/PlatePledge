export type UserRole = 'donor' | 'recipient';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    organization?: string; // For donor businesses
    address?: string;
    preferences?: {
        dietaryRestrictions?: string[];
        maxDistance?: number; // in miles
        notifications?: boolean;
    };
    createdAt: Date;
}

export interface UserRegistration {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    address?: string;
}

export interface UserLogin {
    email: string;
    password: string;
}
