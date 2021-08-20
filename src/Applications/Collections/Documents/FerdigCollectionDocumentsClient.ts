import ApiRequest, {ApiRequestConfig, HTTP_METHOD} from '../../../ApiRequest';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationCollectionsClient} from '../FerdigApplicationCollectionsClient';
import {FerdigApplicationCollectionColumnValueType} from '../FerdigApplicationCollectionColumn';
import {AbstractSocketCrudClient, FerdigObservation} from '../../../AbstractSocketCrudClient';
import {FerdigApplicationCollection} from '../FerdigApplicationCollection';

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

interface SocketChangeEventIdentifier {
    applicationId: string;
    collectionId: string;
    documentId: string;
}

export class FerdigCollectionDocumentsClient<DocumentType> extends AbstractSocketCrudClient<DocumentType & FerdigCollectionDocumentDefaultProperties, DocumentType, Partial<DocumentType>, FerdigCollectionDocumentsListParams<DocumentType>, SocketChangeEventIdentifier> {
    private readonly collectionId: string;
    private readonly applicationId: string;
    private readonly collectionsClient: FerdigApplicationCollectionsClient;
    private readonly collections: Map<string, FerdigObservation<FerdigApplicationCollection>>;

    public constructor(
        api: ApiRequest,
        config: BehaviorSubject<ApiRequestConfig>,
        applicationId: string,
        collectionId: string,
    ) {
        const basePath = `/applications/${applicationId}/collections/${collectionId}/documents`;

        const socketNameSpace = 'applications/collections/documents';
        const socketChangeEventName = `applications/collections/documents::change`;
        const socketChangeEventFilter = (identifier: SocketChangeEventIdentifier) => {
            return (
                identifier.applicationId === applicationId &&
                identifier.collectionId === collectionId
            );
        };
        const socketChangeEventItemMatcher = (
            identifier: SocketChangeEventIdentifier,
            item: DocumentType & FerdigCollectionDocumentDefaultProperties,
        ) => {
            return identifier.documentId === item.id;
        }

        super(
            api,
            config,
            basePath,
            socketNameSpace,
            socketChangeEventName,
            socketChangeEventFilter,
            socketChangeEventItemMatcher,
        );

        this.collectionId = collectionId;
        this.applicationId = applicationId;
        this.collectionsClient = new FerdigApplicationCollectionsClient(api, config, applicationId);
        this.collections = new Map<string, FerdigObservation<FerdigApplicationCollection>>();
    }

    private async getCollection(collectionId: string) {
        let collectionObservation: FerdigObservation<FerdigApplicationCollection> = this.collections.get(collectionId);
        if (!collectionObservation) {
            collectionObservation = await this.collectionsClient.getAndObserve(collectionId);
            this.collections.set(collectionId, collectionObservation);
        }

        return collectionObservation.value;
    }

    protected async objectTransformer(object: ObjectTransformerInputType<DocumentType>): Promise<DocumentType & FerdigCollectionDocumentDefaultProperties> {
        const collection = await this.getCollection(this.collectionId);

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
}
