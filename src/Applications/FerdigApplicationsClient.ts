import ApiRequest from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigCollectionsClient} from './Collections';

export interface FerdigApplicationCreateData {
    internalName: string;
}

export interface FerdigApplicationListParams {
    skip: number;
    take: number;
}

export interface FerdigApplicationListResult {
    applications: FerdigApplication[];
    moreAvailable: boolean;
}

export class FerdigApplicationsClient extends BasicCrudClient<FerdigApplication, FerdigApplicationCreateData, Partial<FerdigApplicationCreateData>, FerdigApplicationListParams, FerdigApplicationListResult> {
    public constructor(api: ApiRequest) {
        const basePath = `/applications`;
        super(api, basePath);
    }

    public collections(applicationId: string) {
        return new FerdigCollectionsClient(this.api, applicationId);
    }
}
