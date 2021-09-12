"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
function reduce(value, fn, initialValue) {
    if (yaml_1.default.isSeq(value))
        return u.reduce(value.items, fn, initialValue);
    return u.reduce(value, fn, initialValue);
}
exports.default = reduce;
//# sourceMappingURL=reduce.js.map