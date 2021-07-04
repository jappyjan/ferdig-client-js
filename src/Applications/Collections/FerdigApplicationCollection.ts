import {FerdigApplicationCollectionColumn} from './FerdigApplicationCollectionColumn';

export interface FerdigApplicationCollection {
    id: string;
    internalName: string;
    createdAt: Date;
    updatedAt: Date;
    columns: FerdigApplicationCollectionColumn[];
}
