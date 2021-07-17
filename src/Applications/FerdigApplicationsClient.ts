import ApiRequest from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigCollectionsClient} from './Collections';
import {FerdigApplicationUsersClient} from './Users';
import {SocketClient} from '../Socket';

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
    public constructor(api: ApiRequest, socket: SocketClient) {
        const basePath = `/applications`;
        super(api, socket, basePath);
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplication> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public collections(applicationId: string): FerdigCollectionsClient {
        return new FerdigCollectionsClient(this.api, this.socket, applicationId);
    }

    public users(applicationId: string): FerdigApplicationUsersClient {
        return new FerdigApplicationUsersClient(this.api, this.socket, applicationId);
    }
}
