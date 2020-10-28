export interface JsonYmlBoolean {
    json: boolean;
    yml: boolean;
}
declare class NOODLObjects {
    name: string;
    objects: {
        [name: string]: {
            json: {
                [key: string]: any;
            };
            yml?: string;
        };
    };
    options: {
        keepYml: boolean;
    };
    constructor(name?: string);
    get(key: string | RegExp, { asYml }?: {
        asYml?: boolean;
    }): any;
    load(name: string, url: string): Promise<{
        json: any;
        yml?: string;
    } | void>;
}
export default NOODLObjects;
