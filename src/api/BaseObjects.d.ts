import Objects from './Objects';
export interface BasesOptions {
    endpoint?: string;
    json?: boolean;
    yml?: boolean;
}
declare class BaseObjects extends Objects {
    #private;
    baseUrl: string;
    noodlEndpoint: string;
    noodlBaseUrl: string;
    version: string;
    constructor();
    init(): Promise<any>;
    get rootConfig(): any;
    get noodlConfig(): any;
    get endpoint(): string;
    set endpoint(endpoint: string);
    get objects(): any;
    getLatestVersion(rootConfig?: any): any;
    getRootConfig(): any;
    getNoodlConfig(): any;
    get onRootConfig(): () => any;
    get onNoodlConfig(): () => any;
    get onBaseItems(): () => any;
    set onRootConfig(fn: () => any);
    set onNoodlConfig(fn: () => any);
    set onBaseItems(fn: () => any);
}
export default BaseObjects;
