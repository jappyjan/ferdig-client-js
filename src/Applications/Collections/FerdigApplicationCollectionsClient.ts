import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigApplicationCollection} from './FerdigApplicationCollection';
import ApiRequest, {ApiRequestConfig} from '../../ApiRequest';
import {
    FerdigCollectionColumnsClient,
    FerdigCollectionColumnsClientObjectTransformerInputType,
} from './Columns/FerdigCollectionColumnsClient';
import {BehaviorSubject, finalize} from 'rxjs';
import {AbstractSocketCrudClient, SocketChangeEvent} from '../../AbstractSocketCrudClient';
import {FerdigListResult} from '../../BasicCrudClient';
import {FerdigApplicationCollectionColumn} from './FerdigApplicationCollectionColumn';

// noinspection JSUnusedGlobalSymbols
export enum FerdigApplicationCollectionDocumentAccessRuleOperator {
    EQUAL = 'EQUAL',
    LESS = 'LESS',
    LESS_OR_EQUAL = 'LESS_OR_EQUAL',
    GREATER = 'GREATER',
    GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    NULL = 'NULL',
}

export interface FerdigApplicationCollectionDocumentAccessRule {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    leftSide: string;
    operator: FerdigApplicationCollectionDocumentAccessRuleOperator;
    rightSide: string;
    and: FerdigApplicationCollectionDocumentAccessRule[];
    or: FerdigApplicationCollectionDocumentAccessRule[];
}

type AccessRuleNonUserProperties = 'id' | 'createdAt' | 'updatedAt' | 'readAccessRule' | 'writeAccessRule';

export type FerdigApplicationCollectionDocumentAccessRuleData =
    Omit<FerdigApplicationCollectionDocumentAccessRule, AccessRuleNonUserProperties>
    & {
    or: FerdigApplicationCollectionDocumentAccessRuleData[];
    and: FerdigApplicationCollectionDocumentAccessRuleData[];
}

export interface FerdigCollectionCreateData {
    internalName: string;
    readAccessRule: FerdigApplicationCollectionDocumentAccessRuleData;
    writeAccessRule: FerdigApplicationCollectionDocumentAccessRuleData;
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
    Omit<FerdigApplicationCollection, 'createdAt' | 'updatedAt' | 'columns'>
    & {
    createdAt: string;
    updatedAt: string;
    columns: FerdigCollectionColumnsClientObjectTransformerInputType[]
};

interface SocketChangeEventIdentifier {
    applicationId: string;
    collectionId: string;
}

interface SocketChangeEventColumnIdentifier {
    applicationId: string;
    collectionId: string;
    columnId: string;
}

export class FerdigApplicationCollectionsClient extends AbstractSocketCrudClient<FerdigApplicationCollection, FerdigCollectionCreateData, Partial<FerdigCollectionCreateData>, FerdigCollectionListParams, SocketChangeEventIdentifier> {
    private readonly applicationId: string;
    private readonly config: BehaviorSubject<ApiRequestConfig>;
    private readonly documentsClientInstances: Map<string, FerdigCollectionDocumentsClient<unknown>>;
    private readonly columnsClientInstances: Map<string, FerdigCollectionColumnsClient>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;

        const socketNameSpace = 'applications/collections';
        const socketChangeEventName = `applications/collections::change`;
        const socketChangeEventFilter = (identifier: SocketChangeEventIdentifier) => {
            return identifier.applicationId === applicationId;
        };
        const socketChangeEventItemMatcher = (
            identifier: SocketChangeEventIdentifier,
            item: FerdigApplicationCollection,
        ) => {
            return identifier.collectionId === item.id;
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

        this.applicationId = applicationId;
        this.config = config;
        this.documentsClientInstances = new Map<string, FerdigCollectionDocumentsClient<unknown>>();
        this.columnsClientInstances = new Map<string, FerdigCollectionColumnsClient>();
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationCollection> {
        const columnsClient = this.columns(object.id);

        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
            columns: await Promise.all(object.columns.map((rawColumn) => {
                return columnsClient.objectTransformer(rawColumn)
            })),
        };
    }

    // noinspection JSUnusedGlobalSymbols
    public documents<DocumentType>(collectionId: string): FerdigCollectionDocumentsClient<DocumentType> {
        let client = this.documentsClientInstances.get(collectionId) as FerdigCollectionDocumentsClient<DocumentType>;
        if (!client) {
            client = new FerdigCollectionDocumentsClient<DocumentType>(this.api, this.config, this.applicationId, collectionId);
            this.documentsClientInstances.set(collectionId, client)
        }

        return client;
    }

    public columns(collectionId: string): FerdigCollectionColumnsClient {
        let client = this.columnsClientInstances.get(collectionId);
        if (!client) {
            client = new FerdigCollectionColumnsClient(this.api, this.applicationId, collectionId);
            this.columnsClientInstances.set(collectionId, client)
        }

        return client;
    }

    protected observeOne(collection: FerdigApplicationCollection): BehaviorSubject<FerdigApplicationCollection | null> {
        const subject = super.observeOne(collection);

        const collectionsClient = this.columns(collection.id);

        const onChangeColumn = async (event: SocketChangeEvent<FerdigCollectionColumnsClientObjectTransformerInputType, SocketChangeEventColumnIdentifier>) => {
            const {item, identifier} = event;

            if (
                identifier.applicationId !== this.applicationId ||
                identifier.collectionId !== collection.id
            ) {
                return;
            }

            const transformed: FerdigApplicationCollectionColumn | null = item === null ? null : await collectionsClient.objectTransformer(item);

            const newColumns: FerdigApplicationCollectionColumn[] = [];
            let found = false;
            subject.value.columns.forEach((existingColumn) => {
                if (existingColumn.id === identifier.columnId) {
                    if (!transformed) {
                        return;
                    }

                    newColumns.push(transformed);
                    found = true;
                    return;
                }

                newColumns.push(existingColumn);
            });

            if (!found && transformed) {
                newColumns.push(transformed);
            }

            subject.next({
                ...subject.value,
                columns: newColumns,
            });
        };

        const COLUMN_CHANGE_EVENT_NAME = 'applications/collections/columns::change';

        this.socket.on(
            COLUMN_CHANGE_EVENT_NAME,
            onChangeColumn.bind(this),
        );

        subject.pipe(
            finalize(() => {
                this.socket.off(
                    COLUMN_CHANGE_EVENT_NAME,
                    onChangeColumn,
                );
            }),
        );

        return subject;
    }

    public async listAndObserve(
        params: FerdigCollectionListParams,
    ): Promise<BehaviorSubject<FerdigListResult<FerdigApplicationCollection>>> {
        const listSubject = await super.listAndObserve(params);

        const columnChangeEventName = `applications/${this.applicationId}/collections/*/columns/*`;

        const collectionsClient = this.columns('');

        const onChangeColumn = async (event: SocketChangeEvent<FerdigCollectionColumnsClientObjectTransformerInputType, SocketChangeEventColumnIdentifier>) => {
            const {item, identifier} = event;

            if (
                identifier.applicationId !== this.applicationId ||
                !listSubject.value.items.map((collection) => collection.id).some((collectionId) => collectionId === identifier.collectionId)
            ) {
                return;
            }

            const transformed: FerdigApplicationCollectionColumn | null = item === null ? null : await collectionsClient.objectTransformer(item);

            const newCollections: FerdigApplicationCollection[] = [];
            listSubject.value.items.forEach((collection) => {
                const newColumns: FerdigApplicationCollectionColumn[] = [];
                let found = false;
                collection.columns.forEach((existingColumn) => {
                    if (existingColumn.id === identifier.columnId) {
                        if (!transformed) {
                            return;
                        }

                        newColumns.push(transformed);
                        found = true;
                        return;
                    }

                    newColumns.push(existingColumn);
                });

                if (!found && transformed) {
                    newColumns.push(transformed);
                }

                newCollections.push({
                    ...collection,
                    columns: newColumns,
                });
            });

            listSubject.next({
                ...listSubject.value,
                items: newCollections,
            });
        };

        this.socket.on(
            columnChangeEventName,
            onChangeColumn,
        );

        listSubject.pipe(
            finalize(() => this.socket.off(columnChangeEventName, onChangeColumn)),
        );

        return listSubject;
    }
}
