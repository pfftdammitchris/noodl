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
    init({ dir, fallback, loadPages: shouldLoadPages, loadPreloadPages: shouldLoadPreloadPages, }?: {
        dir?: string;
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
    /**
     *  Loads the root config. If a directory is given it will attempt to load from a file path. It will fallback to a fresh remote fetch if all else fails
     * @param { string | undefined } options.dir Directory to load the root config from if loading from a directory
     * @param { string | undefined } options.config Config name to override the current config name if provided
     */
    loadRootConfig(opts: {
        dir: string;
        config?: string;
    }): Promise<yaml.Document>;
    loadRootConfig(config: yaml.Document): Promise<yaml.Document>;
    loadRootConfig(configName?: string): Promise<yaml.Document>;
    /**
     * Loads the app config. If a directory is passed it will attempt to load the app config from a file path. It will fallback to a fresh remote fetch if all else fails
     * @param { string | undefined } dir Directory to load from if loading from a directory
     * @param { function | undefined } fallback Used as a resolution strategy to load the app config if fetching fails
     * @returns
     */
    loadAppConfig({ dir, fallback, }?: {
        dir?: string;
        fallback?: () => Promise<string> | string;
    }): Promise<yaml.Document<unknown> | undefined>;
    loadPage(options: {
        name: string;
        doc?: yaml.Document;
        dir: string;
    }): Promise<yaml.Node | yaml.Document<unknown> | undefined>;
    loadPage(name: string | undefined, doc?: yaml.Document): Promise<yaml.Node | yaml.Document<unknown> | undefined>;
    loadPreloadPages({ dir }?: {
        dir?: string;
    }): Promise<any[]>;
    loadPages({ chunks, dir, }?: {
        chunks?: number;
        dir?: string;
    }): Promise<(yaml.Node | yaml.Document<unknown> | undefined)[]>;
    on<Evt extends keyof t.Hooks>(evt: Evt, fn: (args: t.Hooks[Evt]['args']) => void): this;
}
export default NoodlAggregator;
