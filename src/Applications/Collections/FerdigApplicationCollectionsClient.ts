import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigApplicationCollection} from './FerdigApplicationCollection';
import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest, {ApiRequestConfig} from '../../ApiRequest';
import {FerdigCollectionColumnsClient} from './Columns/FerdigCollectionColumnsClient';
import {BehaviorSubject} from 'rxjs';

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
    Omit<FerdigApplicationCollection, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationCollectionsClient extends BasicCrudClient<FerdigApplicationCollection, FerdigCollectionCreateData, Partial<FerdigCollectionCreateData>, FerdigCollectionListParams> {
    private readonly applicationId: string;
    private readonly config: BehaviorSubject<ApiRequestConfig>;
    private readonly documentsClientInstances: Map<string, FerdigCollectionDocumentsClient<unknown>>;
    private readonly columnsClientInstances: Map<string, FerdigCollectionColumnsClient>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;
        super(api, basePath);

        this.applicationId = applicationId;
        this.config = config;
        this.documentsClientInstances = new Map<string, FerdigCollectionDocumentsClient<unknown>>();
        this.columnsClientInstances = new Map<string, FerdigCollectionColumnsClient>();
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationCollection> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

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
}
