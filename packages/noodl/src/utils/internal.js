export const assign = (v, ...rest) => v && isObj(v) && Object.assign(v, ...rest);
export const isArr = (v) => Array.isArray(v);
export const isBool = (v) => typeof v === 'boolean';
export const isNum = (v) => typeof v === 'number';
export const isFnc = (v) => typeof v === 'function';
export const isStr = (v) => typeof v === 'string';
export const isNull = (v) => v === null;
export const isUnd = (v) => v === undefined;
export const isNil = (v) => isNull(v) && isUnd(v);
export const isObj = (v) => !!v && !isArr(v) && typeof v === 'object';
export const isPage = (v) => !!(v && 'doc' in v);
export const trimInitialDots = (v) => {
    if (isStr(v)) {
        if (!v.startsWith('.'))
            return v;
        return v.startsWith('..') ? v.substring(2) : v.substring(1);
    }
    return v;
};
//# sourceMappingURL=internal.js.map