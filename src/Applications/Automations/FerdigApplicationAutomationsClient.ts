import {BasicCrudClient} from '../../BasicCrudClient';
import ApiRequest, {ApiRequestConfig, HTTP_METHOD} from '../../ApiRequest';
import {BehaviorSubject} from 'rxjs';
import {FerdigApplicationAutomation} from './FerdigApplicationAutomation';
import {
    FerdigApplicationAutomationFlowNodeLog,
    FerdigApplicationAutomationFlowNodeType,
} from './FerdigApplicationAutomationFlowNode';

export interface FerdigApplicationAutomationCreateData {
    internalName: string;
}

export interface FerdigApplicationAutomationFlowNodeConfigValueCreateData {
    key: string;
    value: string;
}

export interface FerdigApplicationAutomationFlowNodeCreateData {
    id: string;
    parentId: string | null;
    type: FerdigApplicationAutomationFlowNodeType;
    configValues: FerdigApplicationAutomationFlowNodeConfigValueCreateData[];
}

export interface FerdigApplicationAutomationUpdateData {
    internalName: string;
    flowNodes: FerdigApplicationAutomationFlowNodeCreateData[];
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

export class FerdigApplicationAutomationsClient extends BasicCrudClient<FerdigApplicationAutomation, FerdigApplicationAutomationCreateData, FerdigApplicationAutomationUpdateData, FerdigApplicationAutomationListParams> {
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
            flowNodes: object.flowNodes.map((nodeData) => {
                return {
                    ...nodeData,
                    createdAt: new Date(nodeData.createdAt),
                    updatedAt: new Date(nodeData.updatedAt),
                    configValues: nodeData.configValues.map((configValueData) => {
                        return {
                            ...configValueData,
                            createdAt: new Date(configValueData.createdAt),
                            updatedAt: new Date(configValueData.updatedAt),
                        };
                    }),
                };
            }),
        };
    }

    // TODO: move to sub client
    public async getLogsOfNode(automationId: string, nodeId: string): Promise<FerdigApplicationAutomationFlowNodeLog[]> {
        return await this.api.request<FerdigApplicationAutomationFlowNodeLog[]>(
            {method : HTTP_METHOD.GET, path : `${this.basePath}/${automationId}/nodes/${nodeId}/logs`},
        );
    }
}
