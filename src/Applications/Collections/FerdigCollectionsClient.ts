import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigCollection} from './FerdigCollection';
import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest from '../../ApiRequest';

export interface FerdigCollectionCreateData {
    internalName: string;
}

export interface FerdigCollectionListParams {
    pagination: {
        skip: number;
        take: number;
    };
}

export interface FerdigCollectionListResult {
    collections: FerdigCollection[];
    moreAvailable: number;
}

export class FerdigCollectionsClient extends BasicCrudClient<FerdigCollection, FerdigCollectionCreateData, Partial<FerdigCollectionCreateData>, FerdigCollectionListParams, FerdigCollectionListResult> {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;
        super(api, basePath);

        this.applicationId = applicationId;
    }

    public documents<DocumentType>(collectionId: string): FerdigCollectionDocumentsClient<DocumentType> {
        return new FerdigCollectionDocumentsClient<DocumentType>(this.api, this.applicationId, collectionId);
    }
}
