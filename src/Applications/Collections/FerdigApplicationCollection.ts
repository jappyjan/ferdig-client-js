import {FerdigApplicationCollectionColumn} from './FerdigApplicationCollectionColumn';
import {FerdigApplicationCollectionDocumentAccessRule} from './FerdigCollectionsClient';

export interface FerdigApplicationCollection {
    id: string;
    internalName: string;
    createdAt: Date;
    updatedAt: Date;
    columns: FerdigApplicationCollectionColumn[];
    readAccessRule: FerdigApplicationCollectionDocumentAccessRule;
    writeAccessRule: FerdigApplicationCollectionDocumentAccessRule;
}
