"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApplyReference = void 0;
const yaml_1 = require("yaml");
const regex_1 = require("../internal/regex");
const u = require("./internal");
function isApplyReference(node) {
    if (yaml_1.isScalar(node.key) && u.isStr(node.key.value)) {
        if (regex_1.default.reference.at.apply.test(node.key.value))
            return true;
    }
    return false;
}
exports.isApplyReference = isApplyReference;
//# sourceMappingURL=pair.js.map