export type UserRole = 'donor' | 'recipient';

export interface User {
    name: string;
    role: UserRole;
}
