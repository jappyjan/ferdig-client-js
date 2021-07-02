import {BasicCrudClient} from '../../../BasicCrudClient';
import ApiRequest from '../../../ApiRequest';

export interface FerdigCollectionDocumentDefaultProperties {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FerdigCollectionDocumentsListFilter<DocumentType, Property extends keyof DocumentType> {
    property: Property;
    value: DocumentType[Property];
    and: FerdigCollectionDocumentsListFilter<DocumentType, Property>[];
    or: FerdigCollectionDocumentsListFilter<DocumentType, Property>[];
}

export interface FerdigCollectionDocumentsListPagination {
    skip: number;
    take: number;
}

export interface FerdigCollectionDocumentsListParams<DocumentType> {
    filter?: FerdigCollectionDocumentsListFilter<DocumentType, never>;
    pagination?: FerdigCollectionDocumentsListPagination;
}


type ObjectTransformerInputType<DocumentType> =
    Omit<FerdigCollectionDocumentDefaultProperties, 'createdAt' | 'updatedAt'>
    & DocumentType
    & { createdAt: string; updatedAt: string };

export class FerdigCollectionDocumentsClient<DocumentType> extends BasicCrudClient<DocumentType & FerdigCollectionDocumentDefaultProperties, DocumentType, Partial<DocumentType>, FerdigCollectionDocumentsListParams<DocumentType>> {
    private readonly collectionId: string;
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string, collectionId: string) {
        const basePath = `/collections/${collectionId}/documents`;
        super(api, basePath)

        this.collectionId = collectionId;
        this.applicationId = applicationId;
    }

    protected async objectTransformer(object: ObjectTransformerInputType<DocumentType>): Promise<DocumentType & FerdigCollectionDocumentDefaultProperties> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }
}
