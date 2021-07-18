import {
    FerdigApplicationCollectionColumn,
    FerdigApplicationCollectionColumnValueType,
} from '../FerdigApplicationCollectionColumn';
import {BasicCrudClient} from '../../../BasicCrudClient';
import ApiRequest from '../../../ApiRequest';
import {FerdigApplicationCollectionDocumentAccessRuleData} from '../FerdigApplicationCollectionsClient';

export interface FerdigCollectionColumnCreateData {
    internalName: string;
    isArray: boolean;
    valueType: FerdigApplicationCollectionColumnValueType;
    readAccessRule: FerdigApplicationCollectionDocumentAccessRuleData;
    writeAccessRule: FerdigApplicationCollectionDocumentAccessRuleData;
}

interface ObjectTransformerInputType extends Omit<FerdigApplicationCollectionColumn, 'createdAt' | 'updatedAt'> {
    createdAt: string;
    updatedAt: string;
}

export class FerdigCollectionColumnsClient extends BasicCrudClient<FerdigApplicationCollectionColumn, FerdigCollectionColumnCreateData, Partial<FerdigCollectionColumnCreateData>, unknown> {
    public constructor(api: ApiRequest, applicationId: string, collectionId: string) {
        const basePath = `/applications/${applicationId}/collections/${collectionId}/columns`;
        super(api, basePath);
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationCollectionColumn> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }
}
