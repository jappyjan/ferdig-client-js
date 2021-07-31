export interface FerdigApplicationConfiguration {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    loginRequiresValidEmail: boolean;
}

export interface FerdigApplication {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    internalName: string;
    configuration: FerdigApplicationConfiguration;
}
