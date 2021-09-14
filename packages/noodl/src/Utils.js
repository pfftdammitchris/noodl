var _NoodlUtils_pages, _NoodlUtils_root, _NoodlUtils_common;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import omit from 'lodash/omit';
import * as commonUtils from './utils/index';
import * as u from './utils/internal';
class NoodlUtils {
    constructor({ pages, root }) {
        _NoodlUtils_pages.set(this, void 0);
        _NoodlUtils_root.set(this, void 0);
        _NoodlUtils_common.set(this, omit(commonUtils, 'Identify'));
        __classPrivateFieldSet(this, _NoodlUtils_pages, pages, "f");
        __classPrivateFieldSet(this, _NoodlUtils_root, root, "f");
    }
    get pages() {
        return __classPrivateFieldGet(this, _NoodlUtils_pages, "f");
    }
    get root() {
        return __classPrivateFieldGet(this, _NoodlUtils_root, "f");
    }
    get common() {
        return __classPrivateFieldGet(this, _NoodlUtils_common, "f");
    }
    get Identify() {
        return commonUtils.Identify;
    }
    canUseGetIn(node) {
        return u.isObj(node) && u.isFnc(node.getIn);
    }
    findPage(node) {
        for (const page of this.pages.values()) {
            if (page.contains(node))
                return page;
        }
        return null;
    }
    getValueFromRoot(node) {
        let value = String(this.common.getScalarValue(node));
        const [firstKey, ...paths] = value.split('.').filter(Boolean);
        if (this.pages.has(firstKey)) {
            if (!paths.length) {
                value = this.pages.get(firstKey)?.doc.contents;
            }
            else if (paths.length === 1) {
                value = this.pages.get(firstKey)?.get?.(paths[0]);
            }
            else if (paths.length > 1) {
                value = this.pages.get(firstKey)?.getIn?.(paths);
            }
        }
        else {
            if (this.root.has(firstKey)) {
                const n = firstKey === 'Global' ? this.root.Global : this.root.get(firstKey);
                if (paths.length) {
                    value = this.canUseGetIn(n) ? n.getIn(paths) : n;
                }
                else {
                    value = n;
                }
            }
            else {
                console.log(value);
                console.log(firstKey);
                console.log(firstKey);
                console.log(firstKey);
                return undefined;
            }
        }
        return value;
    }
    isRootReference(node) {
        let value = String(this.common.getScalarValue(node));
        if (commonUtils.isRootReference(value))
            return true;
        value = u.trimInitialDots(value);
        if (value[0] === value[0].toUpperCase())
            return true;
        return this.root.has(value.split('.').filter(Boolean)[0] || '');
    }
}
_NoodlUtils_pages = new WeakMap(), _NoodlUtils_root = new WeakMap(), _NoodlUtils_common = new WeakMap();
export default NoodlUtils;
//# sourceMappingURL=Utils.js.map