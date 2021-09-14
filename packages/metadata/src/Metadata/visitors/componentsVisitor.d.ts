import * as nt from 'noodl-types';
import { VisitorCreation } from '../types';
export interface ComponentsVisitorContext {
    componentTypes: string[];
    componentObjects: nt.ComponentObject[];
    componentsStats: Record<string, number>;
}
declare const componentsVisitor: VisitorCreation<ComponentsVisitorContext>;
export default componentsVisitor;
