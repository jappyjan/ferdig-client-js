import {FerdigCollectionDocumentsClient} from './Documents';
import {FerdigApplicationCollection} from './FerdigApplicationCollection';
import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest from '../../ApiRequest';
import {FerdigCollectionColumnsClient} from './Columns/FerdigCollectionColumnsClient';
import {SocketClient} from '../../Socket';

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

export class FerdigCollectionsClient extends BasicCrudClient<FerdigApplicationCollection, FerdigCollectionCreateData, Partial<FerdigCollectionCreateData>, FerdigCollectionListParams> {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, socket: SocketClient, applicationId: string) {
        const basePath = `/applications/${applicationId}/collections`;
        super(api, socket, basePath);

        this.applicationId = applicationId;
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationCollection> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }

    public documents<DocumentType>(collectionId: string): FerdigCollectionDocumentsClient<DocumentType> {
        return new FerdigCollectionDocumentsClient<DocumentType>(this.api, this.socket, this.applicationId, collectionId);
    }

    public columns(collectionId: string): FerdigCollectionColumnsClient {
        return new FerdigCollectionColumnsClient(this.api, this.applicationId, collectionId);
    }
}
