"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const lodash_set_1 = require("lodash.set");
function set(obj, key, value) {
    if (yaml_1.default.isMap(obj)) {
        obj.set(key, value);
    }
    else if (u.isObj(obj)) {
        lodash_set_1.default(obj, key, value);
    }
}
exports.default = set;
//# sourceMappingURL=set.js.map