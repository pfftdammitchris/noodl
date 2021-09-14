var _Noodl_pages, _Noodl_root, _Noodl_util;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { isMap, isPair } from 'yaml';
import Page from './Page';
import Root from './Root';
import Utils from './Utils';
import { getScalarValue } from './utils/index';
import * as u from './utils/internal';
class Noodl {
    constructor({ root = new Root({}), pages = new Map(), util = new Utils({ pages, root }), } = {}) {
        _Noodl_pages.set(this, void 0);
        _Noodl_root.set(this, void 0);
        _Noodl_util.set(this, void 0);
        __classPrivateFieldSet(this, _Noodl_root, root, "f");
        __classPrivateFieldSet(this, _Noodl_pages, pages, "f");
        __classPrivateFieldSet(this, _Noodl_util, util, "f");
    }
    get pages() {
        return __classPrivateFieldGet(this, _Noodl_pages, "f");
    }
    get root() {
        return __classPrivateFieldGet(this, _Noodl_root, "f");
    }
    get util() {
        return __classPrivateFieldGet(this, _Noodl_util, "f");
    }
    createPage({ name, doc, spread = false, }) {
        let page = __classPrivateFieldGet(this, _Noodl_pages, "f").get(name);
        if (u.isPage(page))
            return page;
        else
            page = new Page(name, doc);
        __classPrivateFieldGet(this, _Noodl_pages, "f").set(name, page);
        this.root.set({
            enumerable: !spread,
            key: name,
            get: () => __classPrivateFieldGet(this, _Noodl_pages, "f").get(name),
            set: (v) => {
                if (!(v instanceof Page)) {
                    const errMsg = `Cannot set the value for page "${name}" because the ` +
                        `value provided is not a page`;
                    throw new Error(errMsg);
                }
                __classPrivateFieldGet(this, _Noodl_pages, "f").set(name, v);
            },
        });
        if (spread) {
            // REMINDER: Only YAMLMap nodes are spreaded to root
            const page = __classPrivateFieldGet(this, _Noodl_pages, "f")?.get?.(name);
            if (isMap(page?.doc.contents)) {
                page?.doc?.contents?.items?.forEach?.((node) => {
                    if (isMap(node)) {
                        node.items?.forEach((pair) => {
                            const rootKey = getScalarValue(pair.key);
                            this.root.set({
                                key: rootKey,
                                get: () => pair.value,
                                set: (v) => (this.root[rootKey] = v),
                            });
                        });
                    }
                    else if (isPair(node)) {
                        const rootKey = getScalarValue(node.key);
                        this.root.set({
                            key: rootKey,
                            get: () => node.value,
                            set: (v) => (this.root[rootKey] = v),
                        });
                    }
                });
            }
        }
        return __classPrivateFieldGet(this, _Noodl_pages, "f").get(name);
    }
    clear() {
        __classPrivateFieldGet(this, _Noodl_pages, "f").clear();
        this.root.clear();
    }
}
_Noodl_pages = new WeakMap(), _Noodl_root = new WeakMap(), _Noodl_util = new WeakMap();
export default Noodl;
//# sourceMappingURL=noodl.js.map