"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPages = exports.extractPreloadPages = void 0;
const yaml_1 = require("yaml");
function extractPreloadPages(doc) {
    if (yaml_1.default.isDocument(doc)) {
        return (doc.get('preload')?.toJSON?.() || []);
    }
    else {
        return doc?.preload || [];
    }
}
exports.extractPreloadPages = extractPreloadPages;
function extractPages(doc) {
    if (yaml_1.default.isDocument(doc)) {
        return (doc.get('page')?.toJSON?.() || []);
    }
    else {
        return doc?.page || [];
    }
}
exports.extractPages = extractPages;
//# sourceMappingURL=utils.js.map