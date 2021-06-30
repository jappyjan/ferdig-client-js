import {BasicCrudClient} from '../../../BasicCrudClient';
import ApiRequest, {HTTP_METHOD} from '../../../ApiRequest';

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

interface ListParams<DocumentType> {
    filter?: ListFilter<DocumentType, never>;
    pagination?: ListPagination;
}

interface ListResult<DocumentType> {
    documents: DocumentType;
    moreAvailable: boolean;
}

export class FerdigCollectionDocumentsClient<DocumentType> extends BasicCrudClient<DocumentType & DefaultDocumentProperties, DocumentType, Partial<DocumentType>> {
    private readonly collectionId: string;
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string, collectionId: string) {
        const basePath = `/collections/${collectionId}/documents`;
        super(api, basePath)

        this.collectionId = collectionId;
        this.applicationId = applicationId;
    }

    public async list(params?: ListParams<DocumentType>): Promise<ListResult<DocumentType>> {
        const {filter, pagination} = params;

        const query: Record<never, never> = {};

        if (pagination) {
            Object.assign(query, pagination);
        }

        return await this.api.request<ListResult<DocumentType>>(
            HTTP_METHOD.POST,
            `${this.basePath}`,
            {
                pagination,
                filter,
            },
        );
    }
}
