"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
function forEach(value, fn) {
    if (yaml_1.default.isSeq(value)) {
        value.items.forEach((item, i, coll) => fn(item, i, coll));
    }
    else if (u.isArr(value)) {
        value.forEach(fn);
    }
}
exports.default = forEach;
//# sourceMappingURL=forEach.js.map