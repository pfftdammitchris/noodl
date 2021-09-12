"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const toString_js_1 = require("./base/toString.js");
function entries(value) {
    if (yaml_1.isMap(value)) {
        return value.items.map((item) => [toString_js_1.default(item), item.value]);
    }
    else if (u.isObj(value)) {
        return u.entries(value);
    }
    return [];
}
exports.default = entries;
//# sourceMappingURL=entries.js.map