import ApiRequest, {ApiRequestConfig} from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigApplicationCollectionsClient} from './Collections';
import {FerdigApplicationUsersClient} from './Users';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationAutomationsClient} from './Automations';
import {FerdigApplicationNotificationTemplatesClient} from './NotificationTemplates';

export interface FerdigApplicationCreateData {
    internalName: string;
}

export interface FerdigApplicationListParams {
    skip: number;
    take: number;
}

type ObjectTransformerInputType =
    Omit<FerdigApplication, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationsClient extends BasicCrudClient<FerdigApplication, FerdigApplicationCreateData, Partial<FerdigApplicationCreateData>, FerdigApplicationListParams> {
    private readonly config: BehaviorSubject<ApiRequestConfig>;
    private readonly collectionsClientInstances: Map<string, FerdigApplicationCollectionsClient>;
    private readonly automationsClientInstances: Map<string, FerdigApplicationAutomationsClient>;
    private readonly notificationTemplatesClientInstances: Map<string, FerdigApplicationNotificationTemplatesClient>;
    private readonly usersClientInstances: Map<string, FerdigApplicationUsersClient>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>) {
        const basePath = `/applications`;
        super(api, basePath);

        this.config = config;
        this.collectionsClientInstances = new Map<string, FerdigApplicationCollectionsClient>();
        this.usersClientInstances = new Map<string, FerdigApplicationUsersClient>();
        this.automationsClientInstances = new Map<string, FerdigApplicationAutomationsClient>();
        this.notificationTemplatesClientInstances = new Map<string, FerdigApplicationNotificationTemplatesClient>();
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplication> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public collections(applicationId: string): FerdigApplicationCollectionsClient {
        let client = this.collectionsClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigApplicationCollectionsClient(this.api, this.config, applicationId);
            this.collectionsClientInstances.set(applicationId, client)
        }

        return client;
    }

    public automations(applicationId: string): FerdigApplicationAutomationsClient {
        let client = this.automationsClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigApplicationAutomationsClient(this.api, this.config, applicationId);
            this.automationsClientInstances.set(applicationId, client)
        }

        return client;
    }

    public notificationTemplates(applicationId: string): FerdigApplicationNotificationTemplatesClient {
        let client = this.notificationTemplatesClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigApplicationNotificationTemplatesClient(this.api, this.config, applicationId);
            this.notificationTemplatesClientInstances.set(applicationId, client)
        }

        return client;
    }

    public users(applicationId: string): FerdigApplicationUsersClient {
        let client = this.usersClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigApplicationUsersClient(this.api, applicationId);
            this.usersClientInstances.set(applicationId, client)
        }

        return client;
    }
}
