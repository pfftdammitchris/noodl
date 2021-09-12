"use strict";
var _NoodlPage_name;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("yaml");
const u = require("./utils/internal");
class NoodlPage {
    constructor(name, doc) {
        _NoodlPage_name.set(this, '');
        if (u.isStr(name) && doc instanceof yaml_1.Document) {
            //
        }
        else if (name instanceof yaml_1.Document) {
            doc = name;
        }
        else if (u.isObj(name)) {
            doc = name.doc;
            name = name.name || '';
        }
        this.doc = doc || new yaml_1.Document();
        name && (this.name = name);
    }
    get name() {
        return tslib_1.__classPrivateFieldGet(this, _NoodlPage_name, "f");
    }
    set name(name) {
        if (this.doc.has(name))
            this.doc.contents = this.doc.get(name);
        tslib_1.__classPrivateFieldSet(this, _NoodlPage_name, name, "f");
    }
    contains(node) {
        let result;
        if (yaml_1.isNode(node)) {
            const key = (yaml_1.isScalar(node)
                ? 'Scalar'
                : yaml_1.isPair(node)
                    ? 'Pair'
                    : yaml_1.isMap(node)
                        ? 'Map'
                        : yaml_1.isSeq(node)
                            ? 'Seq'
                            : undefined);
            if (key) {
                yaml_1.default.visit(this.doc, {
                    [key](_, n) {
                        if (n === node) {
                            result = true;
                            return yaml_1.default.visit.BREAK;
                        }
                    },
                });
            }
        }
        return !!result;
    }
    find(fn) {
        let result = null;
        yaml_1.default.visit(this.doc, (key, node, path) => {
            if (fn(node)) {
                result = node;
                return yaml_1.default.visit.BREAK;
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
exports.default = NoodlPage;
//# sourceMappingURL=Page.js.map