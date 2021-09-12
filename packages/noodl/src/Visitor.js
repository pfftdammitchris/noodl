"use strict";
var _NoodlVisitor_wrapVisitorFn;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("yaml");
const yaml_2 = require("yaml");
const Page_1 = require("./Page");
const Utils_1 = require("./Utils");
class NoodlVisitor {
    constructor({ pages, root, util = new Utils_1.default({ pages, root }), }) {
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
            if (node instanceof Page_1.default) {
                yaml_2.default.visit(node.doc, tslib_1.__classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
            else if (node instanceof yaml_2.default.Document) {
                yaml_2.default.visit(node, tslib_1.__classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
            else if (yaml_1.isNode(node)) {
                yaml_2.default.visit(node, tslib_1.__classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
            }
        }
        else {
            // Visit root
            for (let n of Object.values(this.root)) {
                n = n instanceof Page_1.default ? n.doc : n;
                if (n) {
                    yaml_2.default.visit(n, tslib_1.__classPrivateFieldGet(this, _NoodlVisitor_wrapVisitorFn, "f").call(this, visitor));
                }
            }
        }
        return node;
    }
}
_NoodlVisitor_wrapVisitorFn = new WeakMap();
exports.default = NoodlVisitor;
//# sourceMappingURL=Visitor.js.map