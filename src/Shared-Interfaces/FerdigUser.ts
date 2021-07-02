export interface FerdigUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    hasConsoleAccess: boolean;
    isDisabled: boolean;
}
