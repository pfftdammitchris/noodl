var _NoodlVisitor_wrapVisitorFn;
import { __classPrivateFieldGet } from "tslib";
import { isNode } from 'yaml';
import yaml from 'yaml';
import Page from './Page';
import Utils from './Utils';
class NoodlVisitor {
    constructor({ pages, root, util = new Utils({ pages, root }), }) {
        _NoodlVisitor_wrapVisitorFn.set(this, (visitor) => {
            return (key, node, path) => {
                return visitor({
                    pages: this.pages,
                    root: this.root,
                    key,
                    node: node,
                    path: path,
                }, this.util);
            };
        });
        this.pages = pages;
        this.root = root;
        this.util = util;
    }
    visit(node, visitor) {
        if (!node) {
            throw new Error('The visiting node is null or undefined');
        }
        if (node) {
            if (node instanceof Page) {
                yaml.visit(node.doc, __classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
            else if (node instanceof yaml.Document) {
                yaml.visit(node, __classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
            else if (isNode(node)) {
                yaml.visit(node, __classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
        }
        else {
            // Visit root
            for (let n of Object.values(this.root)) {
                n = n instanceof Page ? n.doc : n;
                if (n) {
                    yaml.visit(n, __classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
                }
            }
        }
        return node;
    }
}
_NoodlVisitor_wrapVisitorFn = new WeakMap();
export default NoodlVisitor;
//# sourceMappingURL=Visitor.js.map