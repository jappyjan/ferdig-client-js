import {BasicCrudClient} from '../../../BasicCrudClient';
import ApiRequest from '../../../ApiRequest';

interface DefaultDocumentProperties {
    id: string;
    createdAt: Date;
    updatedAt: Date;
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
}
