import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigCollection} from './FerdigCollection';
import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest from '../../ApiRequest';

export interface FerdigCollectionCreateData {
    internalName: string;
}

export enum ApplicationCollectionsSortableColumns {
    internalName = 'internalName',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt'
}

export interface FerdigCollectionListParams {
    pagination: {
        skip: number;
        take: number;
    };
    sort?: {
        column: ApplicationCollectionsSortableColumns;
        descending: boolean;
    } | null;
}

type ObjectTransformerInputType =
    Omit<FerdigCollection, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigCollectionsClient extends BasicCrudClient<FerdigCollection, FerdigCollectionCreateData, Partial<FerdigCollectionCreateData>, FerdigCollectionListParams> {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;
        super(api, basePath);

        this.applicationId = applicationId;
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigCollection> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public documents<DocumentType>(collectionId: string): FerdigCollectionDocumentsClient<DocumentType> {
        return new FerdigCollectionDocumentsClient<DocumentType>(this.api, this.applicationId, collectionId);
    }
}
