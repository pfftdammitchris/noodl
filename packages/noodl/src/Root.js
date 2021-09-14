var _NoodlRoot_docs;
import { __classPrivateFieldGet } from "tslib";
// @ts-nocheck
import { YAMLMap, YAMLSeq } from 'yaml';
import * as u from './utils/internal';
class NoodlRoot {
    constructor({ docs, loadOptions, }) {
        _NoodlRoot_docs.set(this, {});
        //
    }
    [(_NoodlRoot_docs = new WeakMap(), Symbol.iterator)]() {
        let items = Object.entries(__classPrivateFieldGet(this, _NoodlRoot_docs, "f"));
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
        return __classPrivateFieldGet(this, _NoodlRoot_docs, "f").Global;
    }
    get userVertex() {
        return this.Global?.getIn(['currentUser', 'vertex']);
    }
    get(name) {
        if (!name || !u.isStr(name))
            return __classPrivateFieldGet(this, _NoodlRoot_docs, "f");
        return __classPrivateFieldGet(this, _NoodlRoot_docs, "f")[name];
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
            if (val instanceof YAMLMap) {
                return val.getIn(paths[1].slice(), true);
            }
            else if (val instanceof YAMLSeq) {
                return val.getIn(paths[1].slice(), true);
            }
            return val;
        }
    }
    has(key) {
        return key in __classPrivateFieldGet(this, _NoodlRoot_docs, "f");
    }
    set(opts, value) {
        if (u.isObj(opts)) {
            const { key, get, set, ...rest } = opts;
            Object.defineProperty(__classPrivateFieldGet(this, _NoodlRoot_docs, "f"), key, {
                configurable: true,
                enumerable: true,
                ...rest,
                get: get?.bind(this),
                set: set?.bind(this),
            });
        }
        else if (u.isStr(opts)) {
            __classPrivateFieldGet(this, _NoodlRoot_docs, "f")[opts] = value;
        }
        return this;
    }
    clear() {
        Object.keys(__classPrivateFieldGet(this, _NoodlRoot_docs, "f")).forEach((key) => delete __classPrivateFieldGet(this, _NoodlRoot_docs, "f")[key]);
    }
}
export default NoodlRoot;
//# sourceMappingURL=Root.js.map