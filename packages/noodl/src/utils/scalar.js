"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreparedKeyForDereference = exports.endsWith = exports.startsWith = exports.isTraverseReference = exports.isEvalReference = exports.isRootReference = exports.isLocalReference = exports.isReference = exports.isString = exports.isNumber = exports.isContinue = exports.isBooleanFalse = exports.isBooleanTrue = exports.isBoolean = exports.getScalarValue = void 0;
const u = require("@jsmanifest/utils");
const noodl_types_1 = require("noodl-types");
const yaml_1 = require("yaml");
const regex_1 = require("../internal/regex");
function getScalarValue(node) {
    return node instanceof yaml_1.Scalar ? node.value : node;
}
exports.getScalarValue = getScalarValue;
function isBoolean(node) {
    const value = getScalarValue(node);
    return [isBooleanTrue, isBooleanFalse].some((fn) => fn(value));
}
exports.isBoolean = isBoolean;
function isBooleanTrue(node) {
    const value = getScalarValue(node);
    return value === 'true' || value === true;
}
exports.isBooleanTrue = isBooleanTrue;
function isBooleanFalse(node) {
    const value = getScalarValue(node);
    return value === 'false' || value === false;
}
exports.isBooleanFalse = isBooleanFalse;
function isContinue(node) {
    return node.value === 'continue';
}
exports.isContinue = isContinue;
function isNumber(node) {
    return u.isNum(node.value);
}
exports.isNumber = isNumber;
function isString(node) {
    return u.isStr(node.value);
}
exports.isString = isString;
function isReference(node) {
    return noodl_types_1.Identify.reference(node.value);
}
exports.isReference = isReference;
function isLocalReference(node) {
    return u.isStr(node.value) && node.value.startsWith('..');
}
exports.isLocalReference = isLocalReference;
function isRootReference(node) {
    return (yaml_1.isScalar(node) &&
        !isLocalReference(node) &&
        u.isStr(node.value) &&
        node.value.startsWith('.'));
}
exports.isRootReference = isRootReference;
function isEvalReference(node) {
    const value = getScalarValue(node);
    if (typeof value !== 'string')
        return false;
    return value.startsWith('=');
}
exports.isEvalReference = isEvalReference;
function isTraverseReference(node) {
    const value = getScalarValue(node);
    if (typeof value !== 'string')
        return false;
    return regex_1.default.reference.underline.traverse.test(value);
}
exports.isTraverseReference = isTraverseReference;
function startsWith(value, node) {
    return isString(node) && node.value.startsWith(value || '');
}
exports.startsWith = startsWith;
function endsWith(value, node) {
    return isString(node) && node.value.endsWith(value || '');
}
exports.endsWith = endsWith;
function getPreparedKeyForDereference(node) {
    let value = getScalarValue(node);
    if (typeof value !== 'string')
        return false;
    if (isLocalReference(value) || isRootReference(value)) {
        value = String(value).trim();
        if (value.startsWith('..')) {
            return value === '..' ? '' : value.replace('..', '');
        }
        else if (value.startsWith('.')) {
            return value === '.' ? '' : value.substring(1);
        }
    }
    return value;
}
exports.getPreparedKeyForDereference = getPreparedKeyForDereference;
//# sourceMappingURL=scalar.js.map