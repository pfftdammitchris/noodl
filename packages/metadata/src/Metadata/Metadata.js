"use strict";
var _Metadata_aggregator, _Metadata_replacePlaceholder, _Metadata_visitors, _Metadata_context;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const u = require("@jsmanifest/utils");
const nu = require("noodl-utils");
const flowRight_1 = require("lodash/flowRight");
const noodl_aggregator_1 = require("noodl-aggregator");
const yaml_1 = require("yaml");
const n = require("../utils");
const baseConfigUrl = 'https://public.aitmed.com/config';
class Metadata {
    constructor(config) {
        _Metadata_aggregator.set(this, void 0);
        _Metadata_replacePlaceholder.set(this, (s) => s);
        _Metadata_visitors.set(this, []);
        _Metadata_context.set(this, {});
        tslib_1.__classPrivateFieldSet(this, _Metadata_aggregator, new noodl_aggregator_1.default(config), "f");
    }
    get context() {
        return tslib_1.__classPrivateFieldGet(this, _Metadata_context, "f");
    }
    get root() {
        return tslib_1.__classPrivateFieldGet(this, _Metadata_aggregator, "f").root;
    }
    createVisitor(fn, options) {
        const { context, visit } = fn(tslib_1.__classPrivateFieldGet(this, _Metadata_aggregator, "f"), options);
        u.assign(this.context, context);
        tslib_1.__classPrivateFieldGet(this, _Metadata_visitors, "f").push(n.createVisitor(visit));
        return this;
    }
    async run() {
        try {
            let { doc: { root: rootDoc, app: appDoc }, raw: { root: rootYml, app: appYml }, } = await tslib_1.__classPrivateFieldGet(this, _Metadata_aggregator, "f").init({
                loadPages: true,
                loadPreloadPages: true,
            });
            const mappingList = u.reduce(tslib_1.__classPrivateFieldGet(this, _Metadata_visitors, "f"), (acc, mapping) => {
                for (const [key, fn] of u.entries(mapping)) {
                    if (!acc[key])
                        acc[key] = [];
                    fn && acc[key].push(fn);
                }
                return acc;
            }, {});
            const getMapping = (label, doc) => u.reduce(u.entries(mappingList), (acc, [k, v]) => {
                acc[k] = flowRight_1.default(...v.map((f) => (key, node, path) => f({ label, doc, key, node, path }, tslib_1.__classPrivateFieldGet(this, _Metadata_context, "f"))));
                return acc;
            }, {});
            for (const [name, doc] of tslib_1.__classPrivateFieldGet(this, _Metadata_aggregator, "f").root) {
                yaml_1.visit(doc, getMapping(name, doc));
            }
            tslib_1.__classPrivateFieldSet(this, _Metadata_replacePlaceholder, nu.createNoodlPlaceholderReplacer({
                cadlBaseUrl: rootDoc.get('cadlBaseUrl'),
                cadlVersion: rootDoc.getIn(['web', 'cadlVersion', 'test']),
                designSuffix: rootDoc.get('designSuffix'),
            }), "f");
            n.purgeRootConfig(rootDoc, tslib_1.__classPrivateFieldGet(this, _Metadata_replacePlaceholder, "f"));
        }
        catch (error) {
            n.throwError(error);
        }
    }
    parseConfig(type) { }
}
_Metadata_aggregator = new WeakMap(), _Metadata_replacePlaceholder = new WeakMap(), _Metadata_visitors = new WeakMap(), _Metadata_context = new WeakMap();
exports.default = Metadata;
//# sourceMappingURL=Metadata.js.map