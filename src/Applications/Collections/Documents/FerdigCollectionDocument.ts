import {FertigCollectionDocumentProperty} from './FertigCollectionDocumentProperty';

export class FerdigCollectionDocument {
    public id: string;
    public createdAt: Date;
    public updateAt: Date;
    public properties: FertigCollectionDocumentProperty[];
}