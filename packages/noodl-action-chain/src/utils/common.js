export function createId() {
    return `_${Math.random().toString(36).substr(2, 9)}`;
}
export function isArray(v) {
    return Array.isArray(v);
}
export function isFunction(v) {
    return typeof v === 'function';
}
export function isPlainObject(v) {
    return !!(v && !Array.isArray(v) && typeof v === 'object');
}
export function isString(v) {
    return typeof v === 'string';
}
//# sourceMappingURL=common.js.map