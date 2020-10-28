import * as C from './constants';
declare type ConsoleLog = typeof console.log;
export interface Log extends ConsoleLog {
    attention(s?: string): Log;
    blank(): Log;
}
export declare type ParseModeModifier = 'default' | 'ui';
export declare type ParseMode = 'json' | 'yml';
export interface AppConfig {
}
export interface AppConfig {
    baseUrl: string;
    assetsUrl: string;
    languageSuffix: string;
    fileSuffix: string;
    startPage: string;
    prelaod: string[];
    page: string[];
}
export interface RootConfig {
    apiHost: string;
    apiPort: string;
    webApiHost: string;
    appApiHost: string;
    connectiontimeout: string;
    loadingLevel: number;
    versionNumber: number;
    debug: string;
    web: {
        cadlVersion: {
            stable: number;
            test: number;
        };
    };
    ios: {
        cadlVersion: {
            stable: number;
            test: number;
        };
    };
    android: {
        cadlVersion: {
            stable: number;
            test: number;
        };
    };
    cadlBaseUrl: string;
    cadlMain: string;
    timestamp: number;
}
export declare type ScriptId = typeof C.RETRIEVE_NOODL_OBJECTS_JSON | typeof C.RETRIEVE_NOODL_OBJECTS_YML | typeof C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS | typeof C.RETRIEVE_NOODL_PROPERTIES;
export {};
