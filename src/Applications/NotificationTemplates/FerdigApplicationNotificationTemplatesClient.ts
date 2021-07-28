import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest, {ApiRequestConfig} from '../../ApiRequest';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationNotificationTemplate} from './FerdigApplicationNotificationTemplate';

export interface FerdigApplicationNotificationTemplateCreateData {
    internalName: string;
    subject: string;
    body: string;
}

export interface FerdigApplicationNotificationTemplateUpdateData {
    internalName: string;
    subject: string;
    body: string;
}

export enum FerdigApplicationNotificationTemplateSortableColumns {
    internalName = 'internalName',
    createdAt = 'createdAt',
    updatedAt = 'updatedAt'
}

export interface FerdigApplicationNotificationTemplatesListParams {
    pagination: {
        skip: number;
        take: number;
    };
    sort?: {
        column: FerdigApplicationNotificationTemplateSortableColumns;
        descending: boolean;
    } | null;
}

type ObjectTransformerInputType =
    Omit<FerdigApplicationNotificationTemplate, 'createdAt' | 'updatedAt'>
    & { createdAt: string; updatedAt: string };

export class FerdigApplicationNotificationTemplatesClient extends BasicCrudClient<FerdigApplicationNotificationTemplate, FerdigApplicationNotificationTemplateCreateData, FerdigApplicationNotificationTemplateUpdateData, FerdigApplicationNotificationTemplatesListParams> {
    private readonly applicationId: string;
    private readonly config: BehaviorSubject<ApiRequestConfig>;

    public constructor(api: ApiRequest, config: BehaviorSubject<ApiRequestConfig>, applicationId: string) {
        const basePath = `/applications/${applicationId}/notifications/templates`;
        super(api, basePath);

        this.applicationId = applicationId;
        this.config = config;
    }

    protected async objectTransformer(object: ObjectTransformerInputType): Promise<FerdigApplicationNotificationTemplate> {
        return {
            ...object,
            createdAt: new Date(object.createdAt),
            updatedAt: new Date(object.updatedAt),
        };
    }
}
