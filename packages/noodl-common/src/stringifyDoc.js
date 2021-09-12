"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
/**
 * Returns the stringified output of the yaml document. If there are errors, it
 * returns a stringified yaml output of the errors instead
 * @param { Document } doc
 */
function stringifyDoc(doc, opts) {
    let result = '';
    if (doc) {
        if (doc.errors.length) {
            result = yaml_1.stringify(doc.errors);
        }
        else {
            result = doc.toString({ singleQuote: true, ...opts });
        }
    }
    return result;
}
exports.default = stringifyDoc;
//# sourceMappingURL=stringifyDoc.js.map