import {FerdigApplicationAutomationFlowNode} from './FerdigApplicationAutomationFlowNode';

export interface FerdigApplicationAutomation {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    internalName: string;
    flowNodes: FerdigApplicationAutomationFlowNode[];
}
