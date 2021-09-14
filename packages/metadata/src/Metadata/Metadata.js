var _Metadata_aggregator, _Metadata_replacePlaceholder, _Metadata_visitors, _Metadata_context;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import * as u from '@jsmanifest/utils';
import * as nu from 'noodl-utils';
import flowRight from 'lodash/flowRight';
import NoodlAggregator from 'noodl-aggregator';
import { visit, } from 'yaml';
import * as n from '../utils';
const baseConfigUrl = 'https://public.aitmed.com/config';
class Metadata {
    constructor(config) {
        _Metadata_aggregator.set(this, void 0);
        _Metadata_replacePlaceholder.set(this, (s) => s);
        _Metadata_visitors.set(this, []);
        _Metadata_context.set(this, {});
        __classPrivateFieldSet(this, _Metadata_aggregator, new NoodlAggregator(config), "f");
    }
    get context() {
        return __classPrivateFieldGet(this, _Metadata_context, "f");
    }
    get root() {
        return __classPrivateFieldGet(this, _Metadata_aggregator, "f").root;
    }
    createVisitor(fn, options) {
        const { context, visit } = fn(__classPrivateFieldGet(this, _Metadata_aggregator, "f"), options);
        u.assign(this.context, context);
        __classPrivateFieldGet(this, _Metadata_visitors, "f").push(n.createVisitor(visit));
        return this;
    }
    async run() {
        try {
            let { doc: { root: rootDoc, app: appDoc }, raw: { root: rootYml, app: appYml }, } = await __classPrivateFieldGet(this, _Metadata_aggregator, "f").init({
                loadPages: true,
                loadPreloadPages: true,
            });
            const mappingList = u.reduce(__classPrivateFieldGet(this, _Metadata_visitors, "f"), (acc, mapping) => {
                for (const [key, fn] of u.entries(mapping)) {
                    if (!acc[key])
                        acc[key] = [];
                    fn && acc[key].push(fn);
                }
                return acc;
            }, {});
            const getMapping = (label, doc) => u.reduce(u.entries(mappingList), (acc, [k, v]) => {
                acc[k] = flowRight(...v.map((f) => (key, node, path) => f({ label, doc, key, node, path }, __classPrivateFieldGet(this, _Metadata_context, "f"))));
                return acc;
            }, {});
            for (const [name, doc] of __classPrivateFieldGet(this, _Metadata_aggregator, "f").root) {
                visit(doc, getMapping(name, doc));
            }
            __classPrivateFieldSet(this, _Metadata_replacePlaceholder, nu.createNoodlPlaceholderReplacer({
                cadlBaseUrl: rootDoc.get('cadlBaseUrl'),
                cadlVersion: rootDoc.getIn(['web', 'cadlVersion', 'test']),
                designSuffix: rootDoc.get('designSuffix'),
            }), "f");
            n.purgeRootConfig(rootDoc, __classPrivateFieldGet(this, _Metadata_replacePlaceholder, "f"));
        }
        catch (error) {
            n.throwError(error);
        }
    }
    parseConfig(type) { }
}
_Metadata_aggregator = new WeakMap(), _Metadata_replacePlaceholder = new WeakMap(), _Metadata_visitors = new WeakMap(), _Metadata_context = new WeakMap();
export default Metadata;
//# sourceMappingURL=Metadata.js.map