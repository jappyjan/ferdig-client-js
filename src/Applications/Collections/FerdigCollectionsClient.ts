import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigCollection} from './FerdigCollection';
import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest from '../../ApiRequest';

interface CollectionCreateData {
    internalName: string;
}

interface ListParams {}

interface ListResult {}

export class FerdigCollectionsClient extends BasicCrudClient<FerdigCollection, CollectionCreateData, Partial<CollectionCreateData>, ListParams, ListResult> {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;
        super(api, basePath);

        this.applicationId = applicationId;
    }

    public documents(collectionId: string) {
        return new FerdigCollectionDocumentsClient(this.api, this.applicationId, collectionId);
    }
}
