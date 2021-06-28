export enum FertigCollectionColumnValueType {
    String = 'string',
    Number = 'number',
    Date = 'date',
}

export class FertigCollectionColumn {
    public id: string;
    public createdAt: Date;
    public updateAt: Date;
    public internalName: string;
    public valueType: FertigCollectionColumnValueType;
    public isArray: boolean;
}
