"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const u = require("@jsmanifest/utils");
const reduce_js_1 = require("./reduce.js");
function flat(value) {
    return reduce_js_1.default(value, (acc, v) => {
        // @ts-expect-error
        if (u.isArr(v))
            acc.push(...flat(v));
        // @ts-expect-error
        if (yaml_1.default.isSeq(v))
            acc.push(...v.items);
        return acc;
    }, []);
}
exports.default = flat;
//# sourceMappingURL=flat.js.map