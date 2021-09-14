import * as u from '@jsmanifest/utils';
import { Identify } from 'noodl-types';
import { isScalar, Scalar } from 'yaml';
import regex from '../internal/regex';
export function getScalarValue(node) {
    return node instanceof Scalar ? node.value : node;
}
export function isBoolean(node) {
    const value = getScalarValue(node);
    return [isBooleanTrue, isBooleanFalse].some((fn) => fn(value));
}
export function isBooleanTrue(node) {
    const value = getScalarValue(node);
    return value === 'true' || value === true;
}
export function isBooleanFalse(node) {
    const value = getScalarValue(node);
    return value === 'false' || value === false;
}
export function isContinue(node) {
    return node.value === 'continue';
}
export function isNumber(node) {
    return u.isNum(node.value);
}
export function isString(node) {
    return u.isStr(node.value);
}
export function isReference(node) {
    return Identify.reference(node.value);
}
export function isLocalReference(node) {
    return u.isStr(node.value) && node.value.startsWith('..');
}
export function isRootReference(node) {
    return (isScalar(node) &&
        !isLocalReference(node) &&
        u.isStr(node.value) &&
        node.value.startsWith('.'));
}
export function isEvalReference(node) {
    const value = getScalarValue(node);
    if (typeof value !== 'string')
        return false;
    return value.startsWith('=');
}
export function isTraverseReference(node) {
    const value = getScalarValue(node);
    if (typeof value !== 'string')
        return false;
    return regex.reference.underline.traverse.test(value);
}
export function startsWith(value, node) {
    return isString(node) && node.value.startsWith(value || '');
}
export function endsWith(value, node) {
    return isString(node) && node.value.endsWith(value || '');
}
export function getPreparedKeyForDereference(node) {
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
//# sourceMappingURL=scalar.js.map