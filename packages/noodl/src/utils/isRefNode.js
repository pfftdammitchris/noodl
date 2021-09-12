"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRefNode(value) {
    return (typeof value !== null &&
        typeof value === 'object' &&
        'type' in (value || {}) &&
        value?.type === 'REFERENCE');
}
exports.default = isRefNode;
//# sourceMappingURL=isRefNode.js.map