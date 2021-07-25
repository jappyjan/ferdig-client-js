export enum FerdigApplicationAutomationFlowNodeType {
    User_Created = 'user::created',
    Auth_Login = 'auth::login',
    NotificationTemplate_Load = 'notification_template::load',
    Notifications_Send = 'notifications::send',
    Automation_ChangePayload = 'automation::change_payload',
    Automation_MapPayload = 'automation::map_payload',
}

export interface FerdigApplicationAutomationFlowNodeConfigValue {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    key: string;
    value: string;
}

export interface FerdigApplicationAutomationFlowNode {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    parentId: string;
    type: FerdigApplicationAutomationFlowNodeType;
    configValues: FerdigApplicationAutomationFlowNodeConfigValue[];
}

export interface FerdigApplicationAutomationFlowNodeLog {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    level: string;
    message: string;
    receivedPayload: string;
}
