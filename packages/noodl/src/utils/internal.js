"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimInitialDots = exports.isPage = exports.isObj = exports.isNil = exports.isUnd = exports.isNull = exports.isStr = exports.isFnc = exports.isNum = exports.isBool = exports.isArr = exports.assign = void 0;
const assign = (v, ...rest) => v && exports.isObj(v) && Object.assign(v, ...rest);
exports.assign = assign;
const isArr = (v) => Array.isArray(v);
exports.isArr = isArr;
const isBool = (v) => typeof v === 'boolean';
exports.isBool = isBool;
const isNum = (v) => typeof v === 'number';
exports.isNum = isNum;
const isFnc = (v) => typeof v === 'function';
exports.isFnc = isFnc;
const isStr = (v) => typeof v === 'string';
exports.isStr = isStr;
const isNull = (v) => v === null;
exports.isNull = isNull;
const isUnd = (v) => v === undefined;
exports.isUnd = isUnd;
const isNil = (v) => exports.isNull(v) && exports.isUnd(v);
exports.isNil = isNil;
const isObj = (v) => !!v && !exports.isArr(v) && typeof v === 'object';
exports.isObj = isObj;
const isPage = (v) => !!(v && 'doc' in v);
exports.isPage = isPage;
const trimInitialDots = (v) => {
    if (exports.isStr(v)) {
        if (!v.startsWith('.'))
            return v;
        return v.startsWith('..') ? v.substring(2) : v.substring(1);
    }
    return v;
};
exports.trimInitialDots = trimInitialDots;
//# sourceMappingURL=internal.js.map