"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const forEach_js_1 = require("./forEach.js");
const set_js_1 = require("./set.js");
function toMap(value) {
    if (yaml_1.default.isMap(value))
        return value;
    if (u.isObj(value)) {
        const map = new yaml_1.YAMLMap();
        u.entries(value).forEach(([k, v]) => map.set(k, v));
        return map;
    }
    return new yaml_1.default.Document(value).contents;
}
function assign(value, ...rest) {
    if (yaml_1.default.isMap(value)) {
        forEach_js_1.default(value, (item) => 
        // @ts-expect-error
        set_js_1.default(value, yaml_1.default.isScalar(item) ? item : String(item), toMap(item.value)));
    }
    else if (u.isObj(value)) {
        u.assign(value, ...rest);
    }
    return value;
}
exports.default = assign;
//# sourceMappingURL=assign.js.map