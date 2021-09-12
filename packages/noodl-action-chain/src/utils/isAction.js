"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAction(obj) {
    return !!(obj &&
        !Array.isArray(obj) &&
        typeof obj === 'object' &&
        !('queue' in obj) &&
        ('hasExecutor' in obj || 'executor' in obj));
}
exports.default = isAction;
//# sourceMappingURL=isAction.js.map