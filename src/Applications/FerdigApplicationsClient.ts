import ApiRequest, {ApiRequestConfig} from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigCollectionsClient} from './Collections';
import {FerdigApplicationUsersClient} from './Users';
import {BehaviorSubject} from 'rxjs';

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
    private readonly collectionsClientInstances: Map<string, FerdigCollectionsClient>;
    private readonly usersClientInstances: Map<string, FerdigApplicationUsersClient>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>) {
        const basePath = `/applications`;
        super(api, basePath);

        this.config = config;
        this.collectionsClientInstances = new Map<string, FerdigCollectionsClient>();
        this.usersClientInstances = new Map<string, FerdigApplicationUsersClient>();
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplication> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public collections(applicationId: string): FerdigCollectionsClient {
        let client = this.collectionsClientInstances.get(applicationId);
        if (!client) {
            client = new FerdigCollectionsClient(this.api, this.config, applicationId);
            this.collectionsClientInstances.set(applicationId, client)
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
