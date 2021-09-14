import * as nt from 'noodl-types';
import { LiteralUnion } from 'type-fest';
import { VisitorCreation } from '../types';
export interface ActionsVisitorContext {
    actionTypes: string[];
    actionObjects: nt.ComponentObject[];
    actionsStats: Record<string, number>;
}
declare const actionsVisitor: VisitorCreation<{
    actionTypes: string[];
    actionObjects: nt.ComponentObject[];
    actionsStats: Record<LiteralUnion<'builtIn', string>, any>;
}>;
export default actionsVisitor;
