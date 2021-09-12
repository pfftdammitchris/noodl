"use strict";
var _NoodlRoot_docs;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// @ts-nocheck
const yaml_1 = require("yaml");
const u = require("./utils/internal");
class NoodlRoot {
    constructor({ docs, loadOptions, }) {
        _NoodlRoot_docs.set(this, {});
        //
    }
    [(_NoodlRoot_docs = new WeakMap(), Symbol.iterator)]() {
        let items = Object.entries(tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f"));
        let index = 0;
        return {
            next() {
                return {
                    done: index >= items.length,
                    value: items[index++],
                };
            },
        };
    }
    get Global() {
        return tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f").Global;
    }
    get userVertex() {
        return this.Global?.getIn(['currentUser', 'vertex']);
    }
    get(name) {
        if (!name || !u.isStr(name))
            return tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f");
        return tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f")[name];
    }
    getIn(path) {
        if (!path)
            return;
        const paths = Array.isArray(path) ? path : path.split('.').filter(Boolean);
        if (paths.length === 1) {
            return this.get(paths[0]);
        }
        else if (paths.length > 1) {
            const val = this.get(paths[0]);
            if (val instanceof yaml_1.YAMLMap) {
                return val.getIn(paths[1].slice(), true);
            }
            else if (val instanceof yaml_1.YAMLSeq) {
                return val.getIn(paths[1].slice(), true);
            }
            return val;
        }
    }
    has(key) {
        return key in tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f");
    }
    set(opts, value) {
        if (u.isObj(opts)) {
            const { key, get, set, ...rest } = opts;
            Object.defineProperty(tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f"), key, {
                configurable: true,
                enumerable: true,
                ...rest,
                get: get?.bind(this),
                set: set?.bind(this),
            });
        }
        else if (u.isStr(opts)) {
            tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f")[opts] = value;
        }
        return this;
    }
    clear() {
        Object.keys(tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f")).forEach((key) => delete tslib_1.__classPrivateFieldGet(this, _NoodlRoot_docs, "f")[key]);
    }
}
exports.default = NoodlRoot;
//# sourceMappingURL=Root.js.map