export interface FerdigUser {
    id: string;
    createdAt: Date;
    updateAt: Date;
    email: string;
    emailVerified: boolean;
    hasConsoleAccess: boolean;
    isDisabled: boolean;
}
