export interface FerdigApplicationNotificationTemplateAction {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    url: string;
    label: string;
}

export interface FerdigApplicationNotificationTemplate {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    internalName: string;
    subject: string;
    body: string;
    actions: FerdigApplicationNotificationTemplateAction[];
}
