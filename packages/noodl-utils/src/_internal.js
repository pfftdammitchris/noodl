export const array = (o) => isArr(o) ? o : [o];
export const isArr = (v) => Array.isArray(v);
export const isBool = (v) => typeof v === 'boolean';
export const isObj = (v) => !!v && !isArr(v) && typeof v === 'object';
export const isNum = (v) => typeof v === 'number';
export const isStr = (v) => typeof v === 'string';
export const isUnd = (v) => typeof v === 'undefined';
export const isFnc = (v) => typeof v === 'function';
export const unwrapObj = (obj) => (isFnc(obj) ? obj() : obj);
//# sourceMappingURL=_internal.js.map