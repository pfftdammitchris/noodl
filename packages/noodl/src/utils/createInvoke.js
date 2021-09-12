"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createInvoke(cb) {
    const invoke = function invoke(o) {
        return cb(o);
    };
    return invoke;
}
exports.default = createInvoke;
//# sourceMappingURL=createInvoke.js.map