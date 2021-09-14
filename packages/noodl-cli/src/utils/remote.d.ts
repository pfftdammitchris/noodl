export declare function configExists(configKey: string): Promise<boolean | Error | undefined>;
export declare function getConfig(configKey: string): Promise<any>;
export declare function s3FileExists(url: string): Promise<boolean | Error | undefined>;
