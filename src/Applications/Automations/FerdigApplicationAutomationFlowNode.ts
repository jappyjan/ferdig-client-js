export enum FerdigApplicationAutomationFlowNodeType {
    User_Created = 'user::created',
    Auth_Login = 'auth::login',
    NotificationTemplate_Load = 'notification_template::load',
}

export interface FerdigApplicationAutomationFlowNode {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string;
    type: FerdigApplicationAutomationFlowNodeType;
}
