"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocWithJsObject = exports.visitor = exports.transformer = exports.dereferencer = exports.noodl = exports.pathToUserVertex = exports.globalPathToUserVertex = void 0;
const yaml_1 = require("yaml");
const Noodl_1 = require("../Noodl");
const Dereferencer_1 = require("../Dereferencer");
const Transformer_1 = require("../Transformer");
const Visitor_1 = require("../Visitor");
exports.globalPathToUserVertex = '.Global.currentUser.vertex';
exports.pathToUserVertex = exports.globalPathToUserVertex.split('.').slice(2); // currentUser.vertex
exports.noodl = new Noodl_1.default();
exports.dereferencer = new Dereferencer_1.default({
    pages: exports.noodl.pages,
    root: exports.noodl.root,
    util: exports.noodl.util,
});
exports.transformer = new Transformer_1.default({
    pages: exports.noodl.pages,
    root: exports.noodl.root,
    util: exports.noodl.util,
});
exports.visitor = new Visitor_1.default({
    pages: exports.noodl.pages,
    root: exports.noodl.root,
    util: exports.noodl.util,
});
function createDocWithJsObject(obj) {
    return yaml_1.default.parseDocument(yaml_1.default.stringify(obj));
}
exports.createDocWithJsObject = createDocWithJsObject;
//# sourceMappingURL=test-utils.js.map