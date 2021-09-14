var _NoodlAggregator_configKey, _NoodlAggregator_configVersion, _NoodlAggregator_toRootPageKey, _NoodlAggregator_getRootConfig;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import * as u from '@jsmanifest/utils';
import { getLinkStructure, stringifyDoc } from 'noodl-common';
import flatten from 'lodash/flatten';
import path from 'path';
import { createNoodlPlaceholderReplacer, hasNoodlPlaceholder, isValidAsset, withYmlExt, } from 'noodl-utils';
import invariant from 'invariant';
import axios from 'axios';
import chalk from 'chalk';
import yaml from 'yaml';
import chunk from 'lodash.chunk';
import { promiseAllSafe } from './utils.js';
import * as c from './constants';
class NoodlAggregator {
    constructor(opts) {
        _NoodlAggregator_configKey.set(this, '');
        _NoodlAggregator_configVersion.set(this, 'latest');
        this.cbs = {};
        this.deviceType = 'web';
        this.env = 'test';
        this.options = {};
        _NoodlAggregator_toRootPageKey.set(this, (filepath, ext = '.yml') => path.posix
            .basename(filepath, ext.startsWith('.') ? ext : `.${ext}`)
            .replace(/(_en|~\/)/gi, ''));
        _NoodlAggregator_getRootConfig.set(this, () => this.root.get(this.configKey));
        if (u.isStr(opts))
            this.configKey = opts;
        else
            u.assign(this.options, opts);
        this.root = new Map([['Global', new yaml.Document()]]);
        Object.defineProperty(this.root, 'toJSON', {
            value: () => {
                const result = {};
                for (const [name, doc] of this.root) {
                    yaml.isDocument(doc) && (result[name] = doc?.toJSON?.());
                }
                return result;
            },
        });
    }
    get appConfigUrl() {
        return `${this.baseUrl}${this.appKey}.yml`;
    }
    get appKey() {
        return ((__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlMain') || '')?.replace('.yml', '') || '');
    }
    get assetsUrl() {
        return (`${__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlBaseUrl') || ''}assets/`.replace(`$\{cadlBaseUrl}`, this.baseUrl) || '');
    }
    get baseUrl() {
        return (__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlBaseUrl') || '');
    }
    get configKey() {
        return __classPrivateFieldGet(this, _NoodlAggregator_configKey, "f");
    }
    set configKey(configKey) {
        __classPrivateFieldSet(this, _NoodlAggregator_configKey, configKey, "f");
        this.emit(c.ON_CONFIG_KEY, configKey);
    }
    get configVersion() {
        if (__classPrivateFieldGet(this, _NoodlAggregator_configVersion, "f") === 'latest') {
            return (__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.getIn?.([
                this.deviceType,
                'cadlVersion',
                this.env,
            ]) || '');
        }
        return __classPrivateFieldGet(this, _NoodlAggregator_configVersion, "f");
    }
    set configVersion(configVersion) {
        __classPrivateFieldSet(this, _NoodlAggregator_configVersion, configVersion, "f");
    }
    get pageNames() {
        const appConfig = this.root.get(this.appKey);
        const preloadPages = appConfig?.get('preload')?.toJSON?.() || [];
        const pages = appConfig?.get('page')?.toJSON?.() || [];
        return [...preloadPages, ...pages];
    }
    emit(event, args) {
        this.cbs[event]?.forEach?.((fn) => fn(args));
    }
    extractAssets({ remote = true } = {}) {
        const assets = [];
        const commonUrlKeys = ['path', 'resource'];
        const visitedAssets = [];
        const addAsset = (assetPath) => {
            if (!visitedAssets.includes(assetPath) && isValidAsset(assetPath)) {
                if (!remote && assetPath.startsWith('http'))
                    return;
                visitedAssets.push(assetPath);
                const linkStructure = getLinkStructure(assetPath, {
                    prefix: this.assetsUrl,
                    config: this.configKey,
                });
                assets.push(linkStructure);
            }
        };
        for (const visitee of this.root.values()) {
            yaml.visit(visitee, {
                Map(key, node) {
                    commonUrlKeys.forEach((key) => {
                        if (node.has(key)) {
                            const value = node.get(key);
                            u.isStr(value) && addAsset(value);
                        }
                    });
                },
                Pair(key, node) {
                    commonUrlKeys.forEach((key) => {
                        if (yaml.isScalar(node.key) && u.isStr(node.key.value)) {
                            if (node.key.value === key) {
                                addAsset(node.value.value);
                            }
                        }
                    });
                },
            });
        }
        return assets;
    }
    getConfigVersion(doc = this.root.get(this.configKey)) {
        return doc?.getIn([
            this.deviceType,
            'cadlVersion',
            this.env,
        ]);
    }
    getPageUrl(pathname) {
        return pathname ? `${this.baseUrl}${pathname}` : '';
    }
    getRawRootConfigYml() {
        return this.root.get(`${this.configKey}_raw`);
    }
    getRawAppConfigYml() {
        return this.root.get(`${this.appKey}_raw`);
    }
    async init({ dir = '', fallback, loadPages: shouldLoadPages = true, loadPreloadPages: shouldLoadPreloadPages = true, } = {}) {
        invariant(!!this.configKey, `Cannot initiate the aggregator without setting a config key first`);
        const result = {
            doc: {
                root: await this.loadRootConfig({ dir }),
                app: await this.loadAppConfig({ dir, fallback: fallback?.appConfig }),
            },
            raw: {
                root: this.getRawRootConfigYml(),
                app: this.getRawAppConfigYml(),
            },
        };
        shouldLoadPreloadPages && (await this.loadPreloadPages({ dir }));
        shouldLoadPages && (await this.loadPages({ dir }));
        return result;
    }
    async loadRootConfig(options = this
        .configKey) {
        let configDoc;
        let configYml = '';
        if (yaml.isDocument(options)) {
            configDoc = options;
            configYml = yaml.stringify(options, { indent: 2 });
        }
        else if (u.isObj(options)) {
            options?.config && (this.configKey = options.config);
            const dir = options.dir || '';
            const configFilePath = path.join(dir, this.configKey);
            const { existsSync, readFile } = await import('fs-extra');
            if (existsSync(configFilePath)) {
                configYml = await readFile(configFilePath, 'utf8');
                configDoc = yaml.parseDocument(configYml);
            }
        }
        else if (u.isStr(options)) {
            this.configKey = options;
        }
        invariant(!!this.configKey, `Cannot retrieve the root config because a config key was not passed in or set`);
        configDoc && !configYml && (configYml = stringifyDoc(configDoc));
        configYml && !configDoc && (configDoc = yaml.parseDocument(configYml));
        if (!configYml || !configDoc) {
            const configUrl = `https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${withYmlExt(this.configKey)}`;
            this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl });
            const { data: yml } = await axios.get(configUrl);
            configDoc = yaml.parseDocument(yml);
            configYml = yml;
        }
        this.root.set(this.configKey, configDoc);
        this.root.set(`${this.configKey}_raw`, configYml);
        this.emit(c.ON_RETRIEVED_ROOT_CONFIG, {
            name: this.configKey,
            doc: configDoc,
            yml: configYml,
        });
        this.configVersion = this.getConfigVersion(configDoc);
        this.emit(c.ON_CONFIG_VERSION, this.configVersion);
        const replacePlaceholders = createNoodlPlaceholderReplacer({
            cadlBaseUrl: configDoc.get('cadlBaseUrl'),
            cadlVersion: this.configVersion,
            designSuffix: '',
        });
        yaml.visit(configDoc, {
            Pair: (key, node) => {
                if (yaml.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
                    if (yaml.isScalar(node.value) &&
                        u.isStr(node.value) &&
                        hasNoodlPlaceholder(node.value)) {
                        const before = node.value.value;
                        node.value.value = replacePlaceholders(node.value.value);
                        this.emit(c.ON_PLACEHOLDER_PURGED, {
                            before,
                            after: node.value.value,
                        });
                        return yaml.visit.SKIP;
                    }
                }
            },
            Scalar: (key, node) => {
                if (u.isStr(node.value) && hasNoodlPlaceholder(node.value)) {
                    const before = node.value;
                    node.value = replacePlaceholders(node.value);
                    this.emit(c.ON_PLACEHOLDER_PURGED, {
                        before,
                        after: node.value,
                    });
                }
            },
        });
        return configDoc;
    }
    /**
     * Loads the app config. If a directory is passed it will attempt to load the app config from a file path. It will fallback to a fresh remote fetch if all else fails
     * @param { string | undefined } dir Directory to load from if loading from a directory
     * @param { function | undefined } fallback Used as a resolution strategy to load the app config if fetching fails
     * @returns
     */
    async loadAppConfig({ dir, fallback, } = {}) {
        invariant(!!this.root.get(this.configKey), 'Cannot initiate app config without retrieving the root config');
        // Placeholders should already have been purged by this time
        let appConfigYml = '';
        let appConfigDoc;
        let yml = '';
        if (dir) {
            const appConfigFilePath = path.join(dir, this.appKey);
            const { existsSync, readFile } = await import('fs-extra');
            if (existsSync(appConfigFilePath)) {
                appConfigYml = await readFile(appConfigFilePath, 'utf8');
                appConfigDoc = yaml.parseDocument(appConfigYml);
            }
        }
        if (!appConfigYml || !appConfigDoc) {
            this.emit(c.ON_RETRIEVING_APP_CONFIG, { url: this.appConfigUrl });
            try {
                yml = (await axios.get(this.appConfigUrl)).data;
            }
            catch (error) {
                console.error(`[${chalk.red('Error')}] ${chalk.yellow('loadAppConfig')}: ${error.message}. ` +
                    `If a fallback loader was provided, it will be used. ` +
                    `Otherwise the app config will be undefined`, { fallbackProvided: u.isFnc(fallback) });
                u.isFnc(fallback) && (yml = await fallback());
            }
        }
        this.emit(c.ON_RETRIEVED_APP_CONFIG, (appConfigYml = yml));
        this.root.set(`${this.appKey}_raw`, appConfigYml);
        appConfigYml && (appConfigDoc = yaml.parseDocument(appConfigYml));
        appConfigDoc && this.root.set(this.appKey, appConfigDoc);
        this.emit(c.PARSED_APP_CONFIG, {
            name: this.appKey,
            doc: appConfigDoc,
        });
        return appConfigDoc;
    }
    async loadPage(options = '', doc) {
        let dir = '';
        let name = '';
        if (u.isObj(options)) {
            name = options.name;
            dir = options.dir;
            doc = options.doc;
        }
        try {
            const key = __classPrivateFieldGet(this, _NoodlAggregator_toRootPageKey, "f").call(this, name);
            if (dir) {
                const { existsSync, readFile } = await import('fs-extra');
                if (existsSync(dir)) {
                    let filepath = '';
                    for (const filename of [`${key}.yml`, `${key}_en.yml`]) {
                        filepath = path.join(dir, filename);
                        if (existsSync(filepath)) {
                            const yml = await readFile(filepath, 'utf8');
                            if (yml) {
                                this.root.set(key, (doc = yaml.parseDocument(yml)));
                                this.emit(c.ON_RETRIEVED_APP_PAGE, {
                                    name,
                                    doc: doc,
                                    fromDir: true,
                                });
                                return this.root.get(key || '');
                            }
                            break;
                        }
                    }
                }
            }
            if (u.isStr(name)) {
                const pageUrl = this.getPageUrl(`${key}_en.yml`);
                const { data: yml } = await axios.get(pageUrl);
                this.root.set(key, (doc = yaml.parseDocument(yml)));
            }
            else if (name && yaml.isDocument(doc)) {
                this.root.set(key, doc);
            }
            else {
                u.log(u.red(`Page "${name}" was not loaded because of bad parameters`));
            }
            if (name) {
                this.emit(c.ON_RETRIEVED_APP_PAGE, { name, doc: doc });
                return this.root.get(key || '');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.response?.status === 404) {
                    console.log(`[${chalk.red(error.name)}]: Could not find page ${u.red(name || '')}`);
                    this.emit(c.ON_APP_PAGE_DOESNT_EXIST, { name: name, error });
                }
                else {
                    console.log(`[${chalk.yellow(error.name)}] on page ${u.red(name || '')}: ${error.message}`);
                }
                this.emit(c.ON_RETRIEVE_APP_PAGE_FAILED, {
                    name: name,
                    error,
                });
            }
        }
    }
    async loadPreloadPages({ dir = '' } = {}) {
        const preloadPages = [];
        const seq = this.root.get(this.appKey)?.get('preload');
        if (yaml.isSeq(seq)) {
            for (const node of seq.items) {
                if (yaml.isScalar(node) && u.isStr(node.value)) {
                    !this.root.has(node.value) && preloadPages.push(node.value);
                }
            }
        }
        return await promiseAllSafe(...preloadPages.map(async (page) => this.loadPage({ name: page, dir })));
    }
    async loadPages({ chunks = 4, dir = '', } = {}) {
        const pages = [];
        const nodes = this.root.get(this.appKey)?.get('page');
        if (yaml.isSeq(nodes)) {
            for (const node of nodes.items) {
                if (yaml.isScalar(node) && u.isStr(node.value)) {
                    !pages.includes(node.value) && pages.push(node.value);
                }
            }
        }
        const chunkedPages = chunk(pages, chunks);
        const allPages = await Promise.all(chunkedPages.map((chunked) => Promise.all(chunked.map(async (c) => this.loadPage({ name: c, dir })))));
        return flatten(allPages);
    }
    on(evt, fn) {
        !u.isArr(this.cbs[evt]) && (this.cbs[evt] = []);
        this.cbs[evt]?.push(fn);
        return this;
    }
}
_NoodlAggregator_configKey = new WeakMap(), _NoodlAggregator_configVersion = new WeakMap(), _NoodlAggregator_toRootPageKey = new WeakMap(), _NoodlAggregator_getRootConfig = new WeakMap();
export default NoodlAggregator;
//# sourceMappingURL=noodl-aggregator.js.map