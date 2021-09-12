"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reference_1 = require("./Reference");
const isRefNode_1 = require("./utils/isRefNode");
class ReferenceBuilder {
    constructor() {
        this.paths = [];
        this.value = '';
    }
    add(key) {
        const reference = isRefNode_1.default(key) ? key : new Reference_1.default(key);
        this.paths.push(reference);
        console.log(reference);
    }
    toString() {
        //
    }
}
exports.default = ReferenceBuilder;
//# sourceMappingURL=ReferenceBuilder.js.map