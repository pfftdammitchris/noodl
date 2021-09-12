"use strict";
var _Dereferencer_pages, _Dereferencer_root, _Dereferencer_util;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("yaml");
const Utils_1 = require("./Utils");
const scalar_1 = require("./utils/scalar");
const u = require("./utils/internal");
class Dereferencer {
    constructor({ pages, root, util = new Utils_1.default({ pages, root }), }) {
        _Dereferencer_pages.set(this, void 0);
        _Dereferencer_root.set(this, void 0);
        _Dereferencer_util.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Dereferencer_pages, pages, "f");
        tslib_1.__classPrivateFieldSet(this, _Dereferencer_root, root, "f");
        tslib_1.__classPrivateFieldSet(this, _Dereferencer_util, util, "f");
    }
    // * Deeply finds the value to the reference and returns it (Does not mutate)
    // TODO - Support apply references
    getReference(ref, rootNode) {
        let value;
        if (u.isStr(ref)) {
            if (ref.startsWith('.') || ref.startsWith('=')) {
                if (ref.startsWith('..')) {
                    ref = ref.substring(2);
                }
                else if (ref.startsWith('.')) {
                    ref = ref.substring(1);
                }
                else if (ref.startsWith('=')) {
                    ref = ref.substring(1);
                }
                return this.getReference(ref);
            }
            else {
                if (ref[0] === ref[0].toUpperCase()) {
                    value = this.getRootReference(ref);
                }
                else if (ref[0] === ref[0].toLowerCase()) {
                    value = this.getLocalReference(ref, { page: rootNode });
                }
            }
        }
        return value;
    }
    getLocalReference(node, { keepScalar = false, page, }) {
        if (!page) {
            throw new Error(`A root node was not provided for local reference: ${node}`);
        }
        let value = page.getIn(u.trimInitialDots(scalar_1.getScalarValue(node)).split('.'), keepScalar);
        if (u.isStr(value) && scalar_1.isReference(value)) {
            value = this.getReference(value, page);
        }
        return value;
    }
    getRootReference(node, { keepScalar = false } = {}) {
        const path = u.trimInitialDots(scalar_1.getScalarValue(node));
        const [key, ...paths] = path.split('.').filter(Boolean);
        let value;
        if (tslib_1.__classPrivateFieldGet(this, _Dereferencer_pages, "f").has(key)) {
            if (!paths.length) {
                value = tslib_1.__classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.doc.contents;
            }
            else if (paths.length === 1) {
                value = tslib_1.__classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.get?.(paths[0], true);
            }
            else if (paths.length > 1) {
                value = tslib_1.__classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.getIn?.(paths, true);
            }
        }
        else {
            if (tslib_1.__classPrivateFieldGet(this, _Dereferencer_root, "f").has(key)) {
                const n = key === 'Global' ? tslib_1.__classPrivateFieldGet(this, _Dereferencer_root, "f").Global : tslib_1.__classPrivateFieldGet(this, _Dereferencer_root, "f").get(key);
                if (paths.length) {
                    value = tslib_1.__classPrivateFieldGet(this, _Dereferencer_util, "f").canUseGetIn(n) ? n.getIn(paths, keepScalar) : n;
                }
                else {
                    value = n;
                }
            }
            else {
                return undefined;
            }
        }
        if (yaml_1.isScalar(value) && scalar_1.isReference(value)) {
            if (scalar_1.isLocalReference(value)) {
                for (const page of tslib_1.__classPrivateFieldGet(this, _Dereferencer_pages, "f").values()) {
                    if (page.contains(value)) {
                        const [k, ...p] = value.value.split('.');
                        if (p.length) {
                            if (p.length === 1) {
                                value = page.get(p);
                            }
                            else if (p.length > 1) {
                                value = page.getIn(p);
                            }
                        }
                        else {
                            value = page.get(k);
                        }
                    }
                }
            }
            else if (scalar_1.isRootReference(value)) {
                value = this.getRootReference(value.value);
            }
        }
        return value;
    }
}
_Dereferencer_pages = new WeakMap(), _Dereferencer_root = new WeakMap(), _Dereferencer_util = new WeakMap();
exports.default = Dereferencer;
//# sourceMappingURL=Dereferencer.js.map