import {FerdigApplicationCollectionDocumentAccessRule} from './FerdigApplicationCollectionsClient';

export enum FerdigApplicationCollectionColumnValueType {
    String = 'string',
    Number = 'number',
    Date = 'date',
    Boolean = 'boolean',
}

export interface FerdigApplicationCollectionColumn {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    internalName: string;
    isArray: boolean;
    valueType: FerdigApplicationCollectionColumnValueType;
    readAccessRule: FerdigApplicationCollectionDocumentAccessRule;
    writeAccessRule: FerdigApplicationCollectionDocumentAccessRule;
}
