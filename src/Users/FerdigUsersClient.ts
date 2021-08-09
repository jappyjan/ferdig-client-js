import {FerdigUser} from '../Shared-Interfaces';
import {BasicCrudClient, FerdigListResult} from '../BasicCrudClient';
import {FerdigAuthSignupPayload} from '../Auth';
import ApiRequest, {HTTP_METHOD} from '../ApiRequest';

export enum FerdigUsersSortableColumns {
    email = 'email',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    disabled = 'disabled',
}

export interface FerdigUsersListParams {
    pagination?: {
        skip: number;
        take: number;
    };
    sort?: {
        column: FerdigUsersSortableColumns;
        descending: boolean;
    } | null;
}

type ObjectTransformerInputType =
    Omit<FerdigUser, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigUsersClient extends BasicCrudClient<FerdigUser, FerdigAuthSignupPayload, unknown, FerdigUsersListParams> {
    public constructor(api: ApiRequest) {
        const basePath = `/users`;
        super(api, basePath);
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigUser> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public async verifyEmail(userId: string, token: string): Promise<void> {
        await this.api.request(
            {method : HTTP_METHOD.POST, path : `${this.basePath}/${userId}/verify-email`, payload : {token}},
        );
    }

    public async list(params: FerdigUsersListParams, applicationId?: string): Promise<FerdigListResult<FerdigUser>> {
        let query = '';
        if (applicationId) {
            query = `?applicationId=${applicationId}`;
        }

        return super.list(params, query);
    }
}
