import {BasicCrudClient} from '../../../BasicCrudClient';
import ApiRequest from '../../../ApiRequest';

interface DefaultDocumentProperties {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ListFilter<DocumentType, Property extends keyof DocumentType> {
    property: Property;
    value: DocumentType[Property];
    and: ListFilter<DocumentType, Property>[];
    or: ListFilter<DocumentType, Property>[];
}

interface ListPagination {
    skip: number;
    take: number;
}

interface ListResult<DocumentType> {
    documents: DocumentType[];
    moreAvailable: boolean;
}

interface ListParams<DocumentType> {
    filter?: ListFilter<DocumentType, never>;
    pagination?: ListPagination;
}

export class FerdigCollectionDocumentsClient<DocumentType> extends BasicCrudClient<DocumentType & DefaultDocumentProperties, DocumentType, Partial<DocumentType>, ListParams<DocumentType>, ListResult<DocumentType>> {
    private readonly collectionId: string;
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string, collectionId: string) {
        const basePath = `/collections/${collectionId}/documents`;
        super(api, basePath)

        this.collectionId = collectionId;
        this.applicationId = applicationId;
    }
}
