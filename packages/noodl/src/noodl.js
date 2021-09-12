"use strict";
var _Noodl_pages, _Noodl_root, _Noodl_util;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("yaml");
const Page_1 = require("./Page");
const Root_1 = require("./Root");
const Utils_1 = require("./Utils");
const index_1 = require("./utils/index");
const u = require("./utils/internal");
class Noodl {
    constructor({ root = new Root_1.default({}), pages = new Map(), util = new Utils_1.default({ pages, root }), } = {}) {
        _Noodl_pages.set(this, void 0);
        _Noodl_root.set(this, void 0);
        _Noodl_util.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Noodl_root, root, "f");
        tslib_1.__classPrivateFieldSet(this, _Noodl_pages, pages, "f");
        tslib_1.__classPrivateFieldSet(this, _Noodl_util, util, "f");
    }
    get pages() {
        return tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f");
    }
    get root() {
        return tslib_1.__classPrivateFieldGet(this, _Noodl_root, "f");
    }
    get util() {
        return tslib_1.__classPrivateFieldGet(this, _Noodl_util, "f");
    }
    createPage({ name, doc, spread = false, }) {
        let page = tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").get(name);
        if (u.isPage(page))
            return page;
        else
            page = new Page_1.default(name, doc);
        tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").set(name, page);
        this.root.set({
            enumerable: !spread,
            key: name,
            get: () => tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").get(name),
            set: (v) => {
                if (!(v instanceof Page_1.default)) {
                    const errMsg = `Cannot set the value for page "${name}" because the ` +
                        `value provided is not a page`;
                    throw new Error(errMsg);
                }
                tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").set(name, v);
            },
        });
        if (spread) {
            // REMINDER: Only YAMLMap nodes are spreaded to root
            const page = tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f")?.get?.(name);
            if (yaml_1.isMap(page?.doc.contents)) {
                page?.doc?.contents?.items?.forEach?.((node) => {
                    if (yaml_1.isMap(node)) {
                        node.items?.forEach((pair) => {
                            const rootKey = index_1.getScalarValue(pair.key);
                            this.root.set({
                                key: rootKey,
                                get: () => pair.value,
                                set: (v) => (this.root[rootKey] = v),
                            });
                        });
                    }
                    else if (yaml_1.isPair(node)) {
                        const rootKey = index_1.getScalarValue(node.key);
                        this.root.set({
                            key: rootKey,
                            get: () => node.value,
                            set: (v) => (this.root[rootKey] = v),
                        });
                    }
                });
            }
        }
        return tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").get(name);
    }
    clear() {
        tslib_1.__classPrivateFieldGet(this, _Noodl_pages, "f").clear();
        this.root.clear();
    }
}
_Noodl_pages = new WeakMap(), _Noodl_root = new WeakMap(), _Noodl_util = new WeakMap();
exports.default = Noodl;
//# sourceMappingURL=noodl.js.map