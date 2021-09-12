"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAction_1 = require("./isAction");
function isActionChain(obj) {
    return !!(obj &&
        typeof obj === 'object' &&
        !isAction_1.default(obj) &&
        ('queue' in obj || 'loadQueue' in obj));
}
exports.default = isActionChain;
//# sourceMappingURL=isActionChain.js.map