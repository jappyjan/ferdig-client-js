import {FerdigApplicationCollectionColumn} from '../FerdigApplicationCollectionColumn';

export class FertigCollectionDocumentProperty {
    public id: string;
    public createdAt: Date;
    public updateAt: Date;
    public column: FerdigApplicationCollectionColumn;
    public value: string;
}
