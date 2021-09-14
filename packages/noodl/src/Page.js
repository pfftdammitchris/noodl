var _NoodlPage_name;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import yaml, { isNode, isMap, isPair, isSeq, isScalar, Document } from 'yaml';
import * as u from './utils/internal';
class NoodlPage {
    constructor(name, doc) {
        _NoodlPage_name.set(this, '');
        if (u.isStr(name) && doc instanceof Document) {
            //
        }
        else if (name instanceof Document) {
            doc = name;
        }
        else if (u.isObj(name)) {
            doc = name.doc;
            name = name.name || '';
        }
        this.doc = doc || new Document();
        name && (this.name = name);
    }
    get name() {
        return __classPrivateFieldGet(this, _NoodlPage_name, "f");
    }
    set name(name) {
        if (this.doc.has(name))
            this.doc.contents = this.doc.get(name);
        __classPrivateFieldSet(this, _NoodlPage_name, name, "f");
    }
    contains(node) {
        let result;
        if (isNode(node)) {
            const key = (isScalar(node)
                ? 'Scalar'
                : isPair(node)
                    ? 'Pair'
                    : isMap(node)
                        ? 'Map'
                        : isSeq(node)
                            ? 'Seq'
                            : undefined);
            if (key) {
                yaml.visit(this.doc, {
                    [key](_, n) {
                        if (n === node) {
                            result = true;
                            return yaml.visit.BREAK;
                        }
                    },
                });
            }
        }
        return !!result;
    }
    find(fn) {
        let result = null;
        yaml.visit(this.doc, (key, node, path) => {
            if (fn(node)) {
                result = node;
                return yaml.visit.BREAK;
            }
        });
        return result;
    }
    has(key) {
        return this.doc.has(key);
    }
    hasIn(args) {
        return this.doc.hasIn(args);
    }
    get(key, keepScalar = false) {
        return this.doc.get(key, keepScalar);
    }
    getIn(args, keepScalar = false) {
        return this.doc.getIn(args, keepScalar);
    }
}
_NoodlPage_name = new WeakMap();
export default NoodlPage;
//# sourceMappingURL=Page.js.map