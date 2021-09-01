import ApiRequest, {ApiRequestConfig, HTTP_METHOD} from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigApplicationCollectionsClient} from './Collections';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationAutomationsClient} from './Automations';
import {FerdigApplicationNotificationTemplatesClient} from './NotificationTemplates';
import {FerdigApplicationConfigurationClient} from './Config';

export enum FerdigApplicationConfigurationEmailClientType {
    SMTP = 'smtp',
    AWS_SES = 'aws_ses',
}

export interface FerdigApplicationConfigurationEmailAWSSESClientConfig {
    fromAddress: string;
    replyToAddress: string;
}

export interface FerdigApplicationConfigurationEmailSMTPClientConfig {
    host: string;
    port: number;
    ssl: boolean;
    authUser: string;
    authPassword: string;
    fromName: string;
    fromAddress: string;
    replyToName: string;
    replyToAddress: string;
}

export type FerdigApplicationConfigurationEmailClientConfig = {
    [FerdigApplicationConfigurationEmailClientType.AWS_SES]: FerdigApplicationConfigurationEmailAWSSESClientConfig;
    [FerdigApplicationConfigurationEmailClientType.SMTP]: FerdigApplicationConfigurationEmailSMTPClientConfig;
}

export interface FerdigApplicationConfigurationEmailCreateData<type extends FerdigApplicationConfigurationEmailClientType> {
    clientType: type;
    clientConfig: FerdigApplicationConfigurationEmailClientConfig[type];
}

export interface FerdigApplicationConfigurationCreateData<emailType extends FerdigApplicationConfigurationEmailClientType> {
    email: FerdigApplicationConfigurationEmailCreateData<emailType>;
}

export interface FerdigApplicationCreateData<emailType extends FerdigApplicationConfigurationEmailClientType> {
    internalName: string;
    configuration: FerdigApplicationConfigurationCreateData<emailType>;
}

export interface FerdigApplicationListParams {
    skip: number;
    take: number;
}

type ObjectTransformerInputType =
    Omit<FerdigApplication, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationsClient<emailType extends FerdigApplicationConfigurationEmailClientType> extends BasicCrudClient<FerdigApplication, FerdigApplicationCreateData<emailType>, Partial<FerdigApplicationCreateData<emailType>>, FerdigApplicationListParams> {
    private readonly config: BehaviorSubject<ApiRequestConfig>;
    private readonly collectionsClientInstances: Map<string, FerdigApplicationCollectionsClient>;
    private readonly automationsClientInstances: Map<string, FerdigApplicationAutomationsClient>;
    private readonly notificationTemplatesClientInstances: Map<string, FerdigApplicationNotificationTemplatesClient>;
    private readonly configurationClientInstances: Map<string, FerdigApplicationConfigurationClient>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>) {
        const basePath = `/applications`;
        super(api, basePath);

        this.config = config;
        this.collectionsClientInstances = new Map<string, FerdigApplicationCollectionsClient>();
        this.automationsClientInstances = new Map<string, FerdigApplicationAutomationsClient>();
        this.notificationTemplatesClientInstances = new Map<string, FerdigApplicationNotificationTemplatesClient>();
        this.configurationClientInstances = new Map<string, FerdigApplicationConfigurationClient>();
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

    public configuration(applicationId: string): FerdigApplicationConfigurationClient {
        let client = this.configurationClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigApplicationConfigurationClient(this.api, applicationId);
            this.configurationClientInstances.set(applicationId, client)
        }

        return client;
    }

    public async getLogo(applicationId: string): Promise<Blob> {
        return await this.api.request<Blob>(
            {
                method: HTTP_METHOD.GET,
                path: `${this.basePath}/${applicationId}/logo`,
                payload: undefined,
                responseType: 'blob',
            },
        );
    }
}
