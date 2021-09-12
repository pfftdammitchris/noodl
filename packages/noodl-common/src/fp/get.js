"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const lodash_get_1 = require("lodash.get");
const toString_js_1 = require("./base/toString.js");
function get(value, key) {
    if (yaml_1.default.isMap(value)) {
        return value.getIn(u.array(key).map((k) => toString_js_1.default(k).split('.')));
    }
    else if (u.isObj(value)) {
        // @ts-expect-error
        return lodash_get_1.default(value, key);
    }
}
exports.default = get;
//# sourceMappingURL=get.js.map