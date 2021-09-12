"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActionChain = void 0;
const yaml_1 = require("yaml");
const map_1 = require("./map");
function isActionChain(node) {
    return node.items.some((value) => {
        if (value instanceof yaml_1.YAMLMap) {
            return [
                map_1.isEmitObject,
                map_1.isGotoObject,
                map_1.isToastObject,
                map_1.isActionLike,
            ].some((fn) => fn(value));
        }
        return false;
    });
}
exports.isActionChain = isActionChain;
//# sourceMappingURL=seq.js.map