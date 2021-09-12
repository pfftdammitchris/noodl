"use strict";
var _NoodlAggregator_configKey, _NoodlAggregator_configVersion, _NoodlAggregator_toRootPageKey, _NoodlAggregator_getRootConfig;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const u = require("@jsmanifest/utils");
const noodl_common_1 = require("noodl-common");
const flatten_1 = require("lodash/flatten");
const path_1 = require("path");
const noodl_utils_1 = require("noodl-utils");
const invariant_1 = require("invariant");
const axios_1 = require("axios");
const chalk_1 = require("chalk");
const yaml_1 = require("yaml");
const lodash_chunk_1 = require("lodash.chunk");
const c = require("./constants");
class NoodlAggregator {
    constructor(opts) {
        _NoodlAggregator_configKey.set(this, '');
        _NoodlAggregator_configVersion.set(this, 'latest');
        this.cbs = {};
        this.deviceType = 'web';
        this.env = 'test';
        this.options = {};
        _NoodlAggregator_toRootPageKey.set(this, (filepath, ext = '.yml') => path_1.default.posix
            .basename(filepath, ext.startsWith('.') ? ext : `.${ext}`)
            .replace(/(_en|~\/)/gi, ''));
        _NoodlAggregator_getRootConfig.set(this, () => this.root.get(this.configKey));
        if (u.isStr(opts))
            this.configKey = opts;
        else
            u.assign(this.options, opts);
        this.root = new Map([['Global', new yaml_1.default.Document()]]);
        Object.defineProperty(this.root, 'toJSON', {
            value: () => {
                const result = {};
                for (const [name, doc] of this.root) {
                    yaml_1.default.isDocument(doc) && (result[name] = doc.toJSON());
                }
                return result;
            },
        });
    }
    get appConfigUrl() {
        return `${this.baseUrl}${this.appKey}.yml`;
    }
    get appKey() {
        return ((tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlMain') || '')?.replace('.yml', '') || '');
    }
    get assetsUrl() {
        return (`${tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlBaseUrl') || ''}assets/`.replace(`$\{cadlBaseUrl}`, this.baseUrl) || '');
    }
    get baseUrl() {
        return (tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.get?.('cadlBaseUrl') || '');
    }
    get configKey() {
        return tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_configKey, "f");
    }
    set configKey(configKey) {
        tslib_1.__classPrivateFieldSet(this, _NoodlAggregator_configKey, configKey, "f");
        this.emit(c.ON_CONFIG_KEY, configKey);
    }
    get configVersion() {
        if (tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_configVersion, "f") === 'latest') {
            return (tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_getRootConfig, "f").call(this)?.getIn?.([
                this.deviceType,
                'cadlVersion',
                this.env,
            ]) || '');
        }
        return tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_configVersion, "f");
    }
    set configVersion(configVersion) {
        tslib_1.__classPrivateFieldSet(this, _NoodlAggregator_configVersion, configVersion, "f");
    }
    get pageNames() {
        const appConfig = this.root.get(this.appKey);
        const preloadPages = appConfig?.get('preload').toJSON();
        const pages = appConfig?.get('page').toJSON();
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
            if (!visitedAssets.includes(assetPath) && noodl_utils_1.isValidAsset(assetPath)) {
                if (!remote && assetPath.startsWith('http'))
                    return;
                visitedAssets.push(assetPath);
                const linkStructure = noodl_common_1.getLinkStructure(assetPath, {
                    prefix: this.assetsUrl,
                    config: this.configKey,
                });
                assets.push(linkStructure);
            }
        };
        for (const visitee of this.root.values()) {
            yaml_1.default.visit(visitee, {
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
                        if (yaml_1.default.isScalar(node.key) && u.isStr(node.key.value)) {
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
    async init({ fallback, loadPages: shouldLoadPages = true, loadPreloadPages: shouldLoadPreloadPages = true, } = {}) {
        invariant_1.default(!!this.configKey, `Cannot initiate the aggregator without setting a config key first`);
        const result = {
            doc: {
                root: await this.loadRootConfig(),
                app: await this.loadAppConfig({ fallback: fallback?.appConfig }),
            },
            raw: {
                root: this.getRawRootConfigYml(),
                app: this.getRawAppConfigYml(),
            },
        };
        shouldLoadPreloadPages && (await this.loadPreloadPages());
        shouldLoadPages && (await this.loadPages());
        return result;
    }
    async loadRootConfig(configName = this.configKey) {
        let configDoc;
        let configYml = '';
        if (yaml_1.default.isDocument(configName)) {
            configDoc = configName;
            configName = this.configKey;
        }
        else if (u.isStr(configName)) {
            this.configKey = configName;
        }
        invariant_1.default(!!configName, `Cannot retrieve the root config because a config key was not passed in or set`);
        if (configDoc) {
            configYml = noodl_common_1.stringifyDoc(configDoc);
        }
        else {
            const configUrl = `https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${noodl_common_1.withYmlExt(configName)}`;
            this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl });
            const { data: yml } = await axios_1.default.get(configUrl);
            configDoc = yaml_1.default.parseDocument(yml);
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
        const replacePlaceholders = noodl_utils_1.createNoodlPlaceholderReplacer({
            cadlBaseUrl: configDoc.get('cadlBaseUrl'),
            cadlVersion: this.configVersion,
            designSuffix: '',
        });
        yaml_1.default.visit(configDoc, {
            Pair: (key, node) => {
                if (yaml_1.default.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
                    if (yaml_1.default.isScalar(node.value) &&
                        u.isStr(node.value) &&
                        noodl_utils_1.hasNoodlPlaceholder(node.value)) {
                        const before = node.value.value;
                        node.value.value = replacePlaceholders(node.value.value);
                        this.emit(c.ON_PLACEHOLDER_PURGED, {
                            before,
                            after: node.value.value,
                        });
                        return yaml_1.default.visit.SKIP;
                    }
                }
            },
            Scalar: (key, node) => {
                if (u.isStr(node.value) && noodl_utils_1.hasNoodlPlaceholder(node.value)) {
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
    async loadAppConfig({ fallback, } = {}) {
        invariant_1.default(!!this.root.get(this.configKey), 'Cannot initiate app config without retrieving the root config');
        this.emit(c.ON_RETRIEVING_APP_CONFIG, { url: this.appConfigUrl });
        // Placeholders should already have been purged by this time
        let appConfigYml = '';
        let appConfigDoc;
        let yml = '';
        try {
            yml = (await axios_1.default.get(this.appConfigUrl)).data;
        }
        catch (error) {
            console.error(`[${chalk_1.default.red('Error')}] ${chalk_1.default.yellow('loadAppConfig')}: ${error.message}. ` +
                `If a fallback loader was provided, it will be used. ` +
                `Otherwise the app config will be undefined`, { fallbackProvided: u.isFnc(fallback) });
            u.isFnc(fallback) && (yml = await fallback());
        }
        this.emit(c.ON_RETRIEVED_APP_CONFIG, (appConfigYml = yml));
        this.root.set(`${this.appKey}_raw`, appConfigYml);
        appConfigYml && (appConfigDoc = yaml_1.default.parseDocument(appConfigYml));
        appConfigDoc && this.root.set(this.appKey, appConfigDoc);
        this.emit(c.PARSED_APP_CONFIG, {
            name: this.appKey,
            doc: appConfigDoc,
        });
        return appConfigDoc;
    }
    async loadPage(name = '', doc) {
        try {
            const key = tslib_1.__classPrivateFieldGet(this, _NoodlAggregator_toRootPageKey, "f").call(this, name);
            if (u.isStr(name)) {
                const pageUrl = this.getPageUrl(`${key}_en.yml`);
                const { data: yml } = await axios_1.default.get(pageUrl);
                this.root.set(key, (doc = yaml_1.default.parseDocument(yml)));
            }
            else if (name && yaml_1.default.isDocument(doc)) {
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
                    console.log(`[${chalk_1.default.red(error.name)}]: Could not find page ${u.red(name || '')}`);
                    this.emit(c.ON_APP_PAGE_DOESNT_EXIST, { name: name, error });
                }
                else {
                    console.log(`[${chalk_1.default.yellow(error.name)}] on page ${u.red(name || '')}: ${error.message}`);
                }
                this.emit(c.ON_RETRIEVE_APP_PAGE_FAILED, {
                    name: name,
                    error,
                });
            }
        }
    }
    async loadPreloadPages(preloadPages = []) {
        if (preloadPages.length) {
            //
        }
        else {
            const seq = this.root.get(this.appKey)?.get('preload');
            if (yaml_1.default.isSeq(seq)) {
                for (const node of seq.items) {
                    if (yaml_1.default.isScalar(node) && u.isStr(node.value)) {
                        !this.root.has(node.value) && preloadPages.push(node.value);
                    }
                }
            }
        }
        return await noodl_common_1.promiseAllSafe(...preloadPages.map(async (page) => this.loadPage(page)));
    }
    async loadPages({ chunks = 4, } = {}) {
        const pages = [];
        const nodes = this.root.get(this.appKey)?.get('page');
        if (yaml_1.default.isSeq(nodes)) {
            for (const node of nodes.items) {
                if (yaml_1.default.isScalar(node) && u.isStr(node.value)) {
                    !pages.includes(node.value) && pages.push(node.value);
                }
            }
        }
        const chunkedPages = lodash_chunk_1.default(pages, chunks);
        const allPages = await Promise.all(chunkedPages.map((chunked) => Promise.all(chunked.map((c) => this.loadPage(c)))));
        return flatten_1.default(allPages);
    }
    on(evt, fn) {
        !u.isArr(this.cbs[evt]) && (this.cbs[evt] = []);
        this.cbs[evt]?.push(fn);
        return this;
    }
}
_NoodlAggregator_configKey = new WeakMap(), _NoodlAggregator_configVersion = new WeakMap(), _NoodlAggregator_toRootPageKey = new WeakMap(), _NoodlAggregator_getRootConfig = new WeakMap();
exports.default = NoodlAggregator;
//# sourceMappingURL=noodl-aggregator.js.map