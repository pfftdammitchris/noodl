var _Dereferencer_pages, _Dereferencer_root, _Dereferencer_util;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { isScalar } from 'yaml';
import NoodlUtils from './Utils';
import { getScalarValue, isReference, isRootReference, isLocalReference, } from './utils/scalar';
import * as u from './utils/internal';
class Dereferencer {
    constructor({ pages, root, util = new NoodlUtils({ pages, root }), }) {
        _Dereferencer_pages.set(this, void 0);
        _Dereferencer_root.set(this, void 0);
        _Dereferencer_util.set(this, void 0);
        __classPrivateFieldSet(this, _Dereferencer_pages, pages, "f");
        __classPrivateFieldSet(this, _Dereferencer_root, root, "f");
        __classPrivateFieldSet(this, _Dereferencer_util, util, "f");
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
        let value = page.getIn(u.trimInitialDots(getScalarValue(node)).split('.'), keepScalar);
        if (u.isStr(value) && isReference(value)) {
            value = this.getReference(value, page);
        }
        return value;
    }
    getRootReference(node, { keepScalar = false } = {}) {
        const path = u.trimInitialDots(getScalarValue(node));
        const [key, ...paths] = path.split('.').filter(Boolean);
        let value;
        if (__classPrivateFieldGet(this, _Dereferencer_pages, "f").has(key)) {
            if (!paths.length) {
                value = __classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.doc.contents;
            }
            else if (paths.length === 1) {
                value = __classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.get?.(paths[0], true);
            }
            else if (paths.length > 1) {
                value = __classPrivateFieldGet(this, _Dereferencer_pages, "f").get(key)?.getIn?.(paths, true);
            }
        }
        else {
            if (__classPrivateFieldGet(this, _Dereferencer_root, "f").has(key)) {
                const n = key === 'Global' ? __classPrivateFieldGet(this, _Dereferencer_root, "f").Global : __classPrivateFieldGet(this, _Dereferencer_root, "f").get(key);
                if (paths.length) {
                    value = __classPrivateFieldGet(this, _Dereferencer_util, "f").canUseGetIn(n) ? n.getIn(paths, keepScalar) : n;
                }
                else {
                    value = n;
                }
            }
            else {
                return undefined;
            }
        }
        if (isScalar(value) && isReference(value)) {
            if (isLocalReference(value)) {
                for (const page of __classPrivateFieldGet(this, _Dereferencer_pages, "f").values()) {
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
            else if (isRootReference(value)) {
                value = this.getRootReference(value.value);
            }
        }
        return value;
    }
}
_Dereferencer_pages = new WeakMap(), _Dereferencer_root = new WeakMap(), _Dereferencer_util = new WeakMap();
export default Dereferencer;
//# sourceMappingURL=Dereferencer.js.map