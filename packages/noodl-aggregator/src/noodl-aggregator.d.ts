import { LinkStructure } from 'noodl-common';
import type { DeviceType, Env } from 'noodl-types';
import yaml from 'yaml';
import * as t from './types';
declare class NoodlAggregator {
    #private;
    cbs: Record<string, ((...args: any[]) => any)[]>;
    deviceType: DeviceType;
    env: Env;
    options: t.Options;
    root: t.Root;
    constructor(opts?: string | t.Options);
    get appConfigUrl(): string;
    get appKey(): string;
    get assetsUrl(): string;
    get baseUrl(): string;
    get configKey(): string;
    set configKey(configKey: string);
    get configVersion(): string;
    set configVersion(configVersion: string);
    get pageNames(): string[];
    emit<Evt extends keyof t.Hooks>(event: Evt, args: t.Hooks[Evt]['args']): void;
    extractAssets({ remote }?: {
        remote?: boolean;
    }): LinkStructure[];
    getConfigVersion(doc?: yaml.Node | yaml.Document<unknown> | undefined): string;
    getPageUrl(pathname: string | undefined): string;
    getRawRootConfigYml(): string;
    getRawAppConfigYml(): string;
    init({ fallback, loadPages: shouldLoadPages, loadPreloadPages: shouldLoadPreloadPages, }?: {
        fallback?: {
            appConfig?: Parameters<NoodlAggregator['loadAppConfig']>[0]['fallback'];
        };
        loadPages?: boolean;
        loadPreloadPages?: boolean;
    }): Promise<{
        doc: {
            root: yaml.Document<unknown>;
            app: yaml.Document<unknown> | undefined;
        };
        raw: {
            root: string;
            app: string;
        };
    }>;
    loadRootConfig(config: yaml.Document): Promise<yaml.Document>;
    loadRootConfig(configName?: string): Promise<yaml.Document>;
    loadAppConfig({ fallback, }?: {
        fallback?: () => Promise<string> | string;
    }): Promise<yaml.Document<unknown> | undefined>;
    loadPage(name?: string | undefined, doc?: yaml.Document): Promise<yaml.Node | yaml.Document<unknown> | undefined>;
    loadPreloadPages(preloadPages?: string[]): Promise<any[]>;
    loadPages({ chunks, }?: {
        chunks?: number;
    }): Promise<(yaml.Node | yaml.Document<unknown> | undefined)[]>;
    on<Evt extends keyof t.Hooks>(evt: Evt, fn: (args: t.Hooks[Evt]['args']) => void): this;
}
export default NoodlAggregator;
