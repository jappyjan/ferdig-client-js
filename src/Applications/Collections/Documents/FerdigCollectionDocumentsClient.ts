import {BasicCrudClient, FerdigListResult} from '../../../BasicCrudClient';
import ApiRequest, {ApiRequestConfig, HTTP_METHOD} from '../../../ApiRequest';
import {SocketClient} from '../../../Socket';
import {BehaviorSubject, finalize} from 'rxjs';
import {FerdigApplicationCollectionsClient} from '../FerdigApplicationCollectionsClient';
import {FerdigApplicationCollectionColumnValueType} from '../FerdigApplicationCollectionColumn';

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
    identifier: {
        applicationId: string;
        collectionId: string;
        documentId: string;
    };
    document: DocumentType;
}

export class FerdigCollectionDocumentsClient<DocumentType> extends BasicCrudClient<DocumentType & FerdigCollectionDocumentDefaultProperties, DocumentType, Partial<DocumentType>, FerdigCollectionDocumentsListParams<DocumentType>> {
    private readonly collectionId: string;
    private readonly applicationId: string;
    protected readonly socket: SocketClient;
    private readonly collectionsClient: FerdigApplicationCollectionsClient;

    public constructor(
        api: ApiRequest,
        config: BehaviorSubject<ApiRequestConfig>,
        applicationId: string,
        collectionId: string,
    ) {
        const basePath = `/applications/${applicationId}/collections/${collectionId}/documents`;
        super(api, basePath)

        this.collectionId = collectionId;
        this.applicationId = applicationId;
        this.collectionsClient = new FerdigApplicationCollectionsClient(api, config, applicationId);

        this.socket = new SocketClient(config, 'applications/collections/documents');
    }

    protected async objectTransformer(object: ObjectTransformerInputType<DocumentType>): Promise<DocumentType & FerdigCollectionDocumentDefaultProperties> {
        // TODO: make collections reactive (like documents) and replace this with an observable
        const collection = await this.collectionsClient.get(this.collectionId);

        const transformed: DocumentType & FerdigCollectionDocumentDefaultProperties = {
            ...object,
            id: object.id,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };

        collection.columns.forEach((column) => {
            if (column.valueType !== FerdigApplicationCollectionColumnValueType.Date) {
                return;
            }

            transformed[column.internalName] = new Date(object[column.internalName]);
        });

        return transformed;
    }

    private observeOne(document: DocumentType & FerdigCollectionDocumentDefaultProperties) {
        const documentSubject = new BehaviorSubject(document);

        const eventName = `application/${this.applicationId}/collections/${this.collectionId}/documents/${document.id}`;

        const onChange = async (document: null | ObjectTransformerInputType<DocumentType>) => {
            const transformedDocument = document === null ? null : await this.objectTransformer(document);

            documentSubject.next(transformedDocument);

            if (document === null) {
                documentSubject.complete();
            }
        };

        documentSubject.pipe(
            finalize(() => this.socket.off(eventName, onChange)),
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return documentSubject;
    }

    public async create(data: DocumentType): Promise<DocumentType & FerdigCollectionDocumentDefaultProperties> {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            formData.set(key, data[key]);
        });

        const rawDocument: ObjectTransformerInputType<DocumentType> = await this.api.request({
                method: HTTP_METHOD.POST,
                path: this.basePath,
                payload: formData,
                contentType: 'multipart/form-data',
            },
        );

        return this.objectTransformer(rawDocument);
    }

    public async update(id: string, data: Partial<DocumentType>): Promise<DocumentType & FerdigCollectionDocumentDefaultProperties> {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            formData.set(key, data[key]);
        });

        const rawDocument = await this.api.request<ObjectTransformerInputType<DocumentType>>({
                method: HTTP_METHOD.PUT,
                path: `${this.basePath}/${id}`,
                payload: formData,
                contentType: 'multipart/form-data',
            },
        );

        return this.objectTransformer(rawDocument);
    }

    public async createAndObserve(data: DocumentType): Promise<BehaviorSubject<DocumentType & FerdigCollectionDocumentDefaultProperties>> {
        const document = await this.create(data);
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

        const eventName = `applications/${this.applicationId}/collections/${this.collectionId}/documents/*`;

        const onChange = async (event: WildcardDocumentChangeEvent<ObjectTransformerInputType<DocumentType>>) => {
            if (event.identifier.applicationId !== this.applicationId || event.identifier.collectionId !== this.collectionId) {
                return;
            }

            const transformedDocument = await this.objectTransformer(event.document);

            // TODO: filter by params.filter
            const items: Array<DocumentType & FerdigCollectionDocumentDefaultProperties> = [];

            let found = false;
            resultSubject.value.items.forEach((item) => {
                if (event.identifier.documentId === item.id) {
                    found = true;
                    if (event.document === null) {
                        return;
                    }

                    items.push(transformedDocument);
                    return;
                }

                items.push(item);
            });
            if (!found && event.document !== null) {
                items.push(transformedDocument);
            }

            resultSubject.next({
                ...resultSubject.value,
                items,
            });
        };

        resultSubject.pipe(
            finalize(() => this.socket.off(eventName, onChange)),
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return resultSubject;
    }
}
