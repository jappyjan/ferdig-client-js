import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest, {ApiRequestConfig} from '../../ApiRequest';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationAutomation} from './FerdigApplicationAutomation';

export interface FerdigApplicationAutomationCreateData {
    internalName: string;
}

export enum FerdigApplicationAutomationSortableColumns {
    internalName = 'internalName',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt'
}

export interface FerdigApplicationAutomationListParams {
    pagination: {
        skip: number;
        take: number;
    };
    sort?: {
        column: FerdigApplicationAutomationSortableColumns;
        descending: boolean;
    } | null;
}

type ObjectTransformerInputType =
    Omit<FerdigApplicationAutomation, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationAutomationsClient extends BasicCrudClient<FerdigApplicationAutomation, FerdigApplicationAutomationCreateData, Partial<FerdigApplicationAutomationCreateData>, FerdigApplicationAutomationListParams> {
    private readonly applicationId: string;
    private readonly config: BehaviorSubject<ApiRequestConfig>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>, applicationId: string) {
        const basePath = `/applications/${applicationId}/automations`;
        super(api, basePath);

        this.applicationId = applicationId;
        this.config = config;
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationAutomation> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }
}
