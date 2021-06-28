import {FertigCollectionColumn} from '../FertigCollectionColumn';

export class FertigCollectionDocumentProperty {
    public id: string;
    public createdAt: Date;
    public updateAt: Date;
    public column: FertigCollectionColumn;
    public value: string;
}
