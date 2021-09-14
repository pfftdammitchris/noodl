import * as nt from 'noodl-types';
export interface AppObject<S extends string = string> {
    config: S;
    url: string;
    pathname: string;
    data: null | nt.RootConfig;
}
declare class AitmedApps {
    #private;
    constructor(apps: string | string[]);
    load(apps: string | string[]): Promise<void>;
}
export default AitmedApps;
