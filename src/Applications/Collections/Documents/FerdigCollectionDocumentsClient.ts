import {BasicCrudClient, FerdigListResult} from '../../../BasicCrudClient';
import ApiRequest from '../../../ApiRequest';
import {SocketClient} from '../../../Socket';
import {BehaviorSubject, finalize} from 'rxjs';

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
    filter: FerdigCollectionDocumentsListFilter<DocumentType, never> | null;
    pagination: FerdigCollectionDocumentsListPagination | null;
}

type ObjectTransformerInputType<DocumentType> =
    Omit<FerdigCollectionDocumentDefaultProperties, 'createdAt' | 'updatedAt'>
    & DocumentType
    & { createdAt: string; updatedAt: string };

interface WildcardDocumentChangeEvent<DocumentType> {
    id: string;
    document: DocumentType;
}

export class FerdigCollectionDocumentsClient<DocumentType> extends BasicCrudClient<DocumentType & FerdigCollectionDocumentDefaultProperties, DocumentType, Partial<DocumentType>, FerdigCollectionDocumentsListParams<DocumentType>> {
    private readonly collectionId: string;
    private readonly applicationId: string;

    public constructor(api: ApiRequest, socket: SocketClient, applicationId: string, collectionId: string) {
        const basePath = `/applications/${applicationId}/collections/${collectionId}/documents`;
        super(api, socket, basePath)

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

    private observeOne(document: DocumentType & FerdigCollectionDocumentDefaultProperties) {
        const documentSubject = new BehaviorSubject(document);

        const eventName = `application/${this.applicationId}/collections/${this.collectionId}/documents/${document.id}`;

        const onChange = (document: null | DocumentType & FerdigCollectionDocumentDefaultProperties) => {
            documentSubject.next(document);
            if (document === null) {
                documentSubject.complete();
            }
        };

        documentSubject.pipe(
            finalize(() => this.socket.off(eventName, onChange))
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return documentSubject;
    }

    public async createAndObserve(data: DocumentType): Promise<BehaviorSubject<DocumentType & FerdigCollectionDocumentDefaultProperties>> {
        const document = await super.create(data);
        return this.observeOne(document);
    }

    public async getAndObserve(id: string): Promise<BehaviorSubject<DocumentType & FerdigCollectionDocumentDefaultProperties>> {
        const document = await super.get(id);
        return this.observeOne(document);
    }

    public async listAndObserve(
        params: FerdigCollectionDocumentsListParams<DocumentType>,
    ): Promise<BehaviorSubject<FerdigListResult<DocumentType & FerdigCollectionDocumentDefaultProperties>>> {
        const result = await super.list(params);
        const resultSubject = new BehaviorSubject(result);

        const eventName = `application/${this.applicationId}/collections/${this.collectionId}/documents/*`;

        const onChange = (event: WildcardDocumentChangeEvent<DocumentType & FerdigCollectionDocumentDefaultProperties>) => {
            // TODO: filter by params.filter

            const items: Array<DocumentType & FerdigCollectionDocumentDefaultProperties> = [];

            let found = false;
            resultSubject.value.items.forEach((item) => {
                if (event.id === item.id) {
                    found = true;
                    if (event.document === null) {
                        return;
                    }

                    items.push(event.document);
                    return;
                }

                items.push(item);
            });
            if (!found && event.document !== null) {
                items.push(event.document);
            }

            resultSubject.next({
                ...resultSubject.value,
                items,
            });
        };

        resultSubject.pipe(
            finalize(() => this.socket.off(eventName, onChange))
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return resultSubject;
    }
}
