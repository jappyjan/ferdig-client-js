import {BasicCrudClient} from '../../BasicCrudClient';
import {FerdigUser} from '../../Shared-Interfaces';
import {FerdigAuthSignupPayload} from '../../Auth';
import ApiRequest from '../../ApiRequest';

export interface FerdigApplicationUsersListParams {
    pagination?: {
        skip: number;
        take: number;
    }
}

type ObjectTransformerInputType =
    Omit<FerdigUser, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationUsersClient extends BasicCrudClient<FerdigUser, FerdigAuthSignupPayload, unknown, FerdigApplicationUsersListParams> {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string) {
        const basePath = `/applications/${applicationId}/users`;
        super(api, basePath);
        this.applicationId = applicationId;
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigUser> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }
}
