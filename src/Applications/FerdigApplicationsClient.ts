import ApiRequest from '../ApiRequest';
import {BasicCrudClient} from '../BasicCrudClient';
import {FerdigApplication} from './FerdigApplication';
import {FerdigCollectionsClient} from './Collections';

interface ApplicationCreateData {
    internalName: string;
}

interface ListParams {
    skip: number;
    take: number;
}

interface ListResult {
    applications: FerdigApplication[];
    moreAvailable: boolean;
}

export class FerdigApplicationsClient extends BasicCrudClient<FerdigApplication, ApplicationCreateData, Partial<ApplicationCreateData>, ListParams, ListResult> {
    public constructor(api: ApiRequest) {
        const basePath = `/applications`;
        super(api, basePath);
    }

    public collections(applicationId: string) {
        return new FerdigCollectionsClient(this.api, applicationId);
    }
}
