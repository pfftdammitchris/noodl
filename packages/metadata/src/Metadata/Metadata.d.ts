import * as t from './types';
export interface MetadataOptions {
    config: string;
}
declare class Metadata {
    #private;
    constructor(config: MetadataOptions['config']);
    get context(): Record<string, any>;
    get root(): import("noodl-aggregator").Root;
    createVisitor(fn: t.VisitorCreation, options?: Record<string, any>): this;
    run(): Promise<void>;
    parseConfig(type: 'root' | 'app'): void;
}
export default Metadata;
