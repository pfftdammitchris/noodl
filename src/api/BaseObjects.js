"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _endpoint;
Object.defineProperty(exports, "__esModule", { value: true });
const Objects_1 = __importDefault(require("./Objects"));
class BaseObjects extends Objects_1.default {
    constructor() {
        super('BaseObjects');
        _endpoint.set(this, '');
        this.baseUrl = '';
        this.noodlEndpoint = '';
        this.noodlBaseUrl = '';
        this.version = '';
    }
    async init() {
        var _a, _b, _c, _d, _e, _f, _g;
        // Load/save root config in memory
        const rootConfig = (_a = (await this.load('rootConfig', this.endpoint))) === null || _a === void 0 ? void 0 : _a.json;
        let noodlConfig = (await ((_b = this.load('noodlConfig', this.noodlEndpoint)) === null || _b === void 0 ? void 0 : _b.json));
        // Set version, root baseUrl
        this['version'] = this.getLatestVersion();
        this['baseUrl'] = rootConfig.cadlBaseUrl.replace('${cadlVersion}', this.version);
        (_c = this.onRootConfig) === null || _c === void 0 ? void 0 : _c.call(this);
        // Set noodl config, endpoint, baseUrl
        this['noodlEndpoint'] = `${this.baseUrl}${rootConfig.cadlMain}`;
        this['noodlBaseUrl'] = items.noodlConfig.json.baseUrl.replace('${cadlBaseUrl}', this.baseUrl);
        (_d = this.onNoodlConfig) === null || _d === void 0 ? void 0 : _d.call(this);
        if (includeBasePages) {
            const numPreloadingPages = ((_e = this.noodlConfig.json.preload) === null || _e === void 0 ? void 0 : _e.length) || 0;
            for (let index = 0; index < numPreloadingPages; index++) {
                const name = (_f = this.noodlConfig.json.preload) === null || _f === void 0 ? void 0 : _f[index];
                const url = `${this.noodlBaseUrl}${name}_en.yml`;
                await this..loadNoodlObject({ url, name });
            }
            (_g = this.onBaseItems) === null || _g === void 0 ? void 0 : _g.call(this);
        }
        return Object.assign({ rootConfig: this.rootConfig.json, noodlConfig: noodlConfig.json }, this..items);
    }
    get rootConfig() {
        return this..items.rootConfig;
    }
    get noodlConfig() {
        return this..items.noodlConfig;
    }
    get endpoint() {
        return __classPrivateFieldGet(this, _endpoint);
    }
    set endpoint(endpoint) {
        __classPrivateFieldSet(this, _endpoint, endpoint);
    }
    get objects() {
        return this..objects;
    }
    getLatestVersion(rootConfig = this.rootConfig.json) {
        var _a, _b;
        // TODO - Support any shaped config
        return ((_b = (_a = rootConfig === null || rootConfig === void 0 ? void 0 : rootConfig.web) === null || _a === void 0 ? void 0 : _a.cadlVersion) === null || _b === void 0 ? void 0 : _b.test) || (rootConfig === null || rootConfig === void 0 ? void 0 : rootConfig.versionNumber);
    }
    getRootConfig() {
        return this.rootConfig.json;
    }
    getNoodlConfig() {
        return this.noodlConfig.json;
    }
    get onRootConfig() {
        return this.;
    }
    get onNoodlConfig() {
        return this.;
    }
    get onBaseItems() {
        return this.;
    }
    set onRootConfig(fn) {
        this. = fn;
    }
    set onNoodlConfig(fn) {
        this. = fn;
    }
    set onBaseItems(fn) {
        this. = fn;
    }
}
_endpoint = new WeakMap();
exports.default = BaseObjects;
//# sourceMappingURL=BaseObjects.js.map