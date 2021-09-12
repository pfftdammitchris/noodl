"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = exports.isPlainObject = exports.isFunction = exports.isArray = exports.createId = void 0;
function createId() {
    return `_${Math.random().toString(36).substr(2, 9)}`;
}
exports.createId = createId;
function isArray(v) {
    return Array.isArray(v);
}
exports.isArray = isArray;
function isFunction(v) {
    return typeof v === 'function';
}
exports.isFunction = isFunction;
function isPlainObject(v) {
    return !!(v && !Array.isArray(v) && typeof v === 'object');
}
exports.isPlainObject = isPlainObject;
function isString(v) {
    return typeof v === 'string';
}
exports.isString = isString;
//# sourceMappingURL=common.js.map