"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
function toString(v) {
    if (v === null || v === undefined)
        return '';
    if (u.isStr(v))
        return v;
    if (!yaml_1.isNode(v))
        return JSON.stringify(v);
    if (yaml_1.isScalar(v))
        return v.toString();
    if (yaml_1.isPair(v))
        return yaml_1.isScalar(v.key) ? toString(v.key) : String(v.key);
    return JSON.stringify(v.toJSON(), null, 2);
}
exports.default = toString;
//# sourceMappingURL=toString.js.map