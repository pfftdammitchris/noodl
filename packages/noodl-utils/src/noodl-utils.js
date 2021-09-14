import get from 'lodash.get';
import has from 'lodash.has';
import curry from 'lodash.curry';
import flowRight from 'lodash.flowright';
import * as u from './_internal';
export function createPlaceholderReplacer(placeholders, flags) {
    const regexp = new RegExp((u.isArr(placeholders) ? placeholders : [placeholders]).reduce((str, placeholder) => str + (!str ? placeholder : `|${placeholder}`), ''), flags);
    function replace(str, value) {
        if (u.isStr(str)) {
            return str.replace(regexp, String(value));
        }
        else if (u.isObj(str)) {
            const stringified = JSON.stringify(str).replace(regexp, String(value));
            return JSON.parse(stringified);
        }
        return '';
    }
    return replace;
}
export const createNoodlPlaceholderReplacer = (function () {
    const replaceCadlBaseUrl = curry(createPlaceholderReplacer('\\${cadlBaseUrl}', 'gi'));
    const replaceCadlVersion = curry(createPlaceholderReplacer('\\${cadlVersion}', 'gi'));
    const replaceDesignSuffix = curry(createPlaceholderReplacer('\\${designSuffix}', 'gi'));
    const replacerMapper = {
        cadlVersion: replaceCadlVersion,
        designSuffix: replaceDesignSuffix,
        cadlBaseUrl: replaceCadlBaseUrl,
    };
    const createReplacer = (keyMap) => {
        let replacers = [];
        let entries = Object.entries(keyMap);
        if (keyMap.cadlBaseUrl && 'cadlVersion' in keyMap) {
            keyMap.cadlBaseUrl = replaceCadlBaseUrl(keyMap.cadlBaseUrl, keyMap.cadlVersion);
        }
        for (let index = 0; index < entries.length; index++) {
            const [placeholder, value] = entries[index];
            if (placeholder in replacerMapper) {
                const regexStr = '\\${' + placeholder + '}';
                const regex = new RegExp(regexStr, 'gi');
                replacers.push((s) => s.replace(regex, value));
            }
        }
        return flowRight(...replacers);
    };
    return createReplacer;
})();
/**
 * Transforms the dataKey of an emit object. If the dataKey is an object,
 * the values of each property will be replaced by the data value based on
 * the path described in its value. The 2nd arg should be a data object or
 * an array of data objects that will be queried against. Data keys must
 * be stripped of their iteratorVar prior to this call
 * @param { string | object } dataKey - Data key of an emit object
 * @param { object | object[] } dataObject - Data object or an array of data objects
 */
export function createEmitDataKey(dataKey, dataObject, opts) {
    const iteratorVar = opts?.iteratorVar || '';
    if (u.isStr(dataKey)) {
        return findDataValue(dataObject, excludeIteratorVar(dataKey, iteratorVar));
    }
    else if (u.isObj(dataKey)) {
        return Object.keys(dataKey).reduce((acc, property) => {
            acc[property] = findDataValue(dataObject, excludeIteratorVar(dataKey[property], iteratorVar));
            return acc;
        }, {});
    }
    return dataKey;
}
export function excludeIteratorVar(dataKey, iteratorVar = '') {
    if (!u.isStr(dataKey))
        return dataKey;
    if (iteratorVar && dataKey.includes(iteratorVar)) {
        if (dataKey === iteratorVar)
            return '';
        return dataKey.split(`${iteratorVar}.`).join('').replace(iteratorVar, '');
    }
    return dataKey;
}
/**
 * Takes a callback and an "if" object. The callback will receive the three
 * values that the "if" object contains. The first item will be the value that
 * should be evaluated, and the additional (item 2 and 3) arguments will be the values
 * deciding to be returned. If the callback returns true, item 2 is returned. If
 * false, item 3 is returned
 * @param { function } fn - Callback that receives the value being evaluated
 * @param { IfObject } ifObj - The object that contains the "if"
 */
export function evalIf(fn, ifObj) {
    if (Array.isArray(ifObj.if)) {
        const [val, onTrue, onFalse] = ifObj.if;
        return fn(val, onTrue, onFalse) ? onTrue : onFalse;
    }
    return false;
}
/**
 * Runs through objs and returns the value at path if a dataObject is received
 * @param { function | object | array } objs - Data objects to iterate over
 * @param { string | string[] } path
 */
export const findDataValue = (objs, path) => {
    if (!path)
        return u.unwrapObj(u.isArr(objs) ? objs[0] : objs);
    return get(u.unwrapObj((u.isArr(objs) ? objs : [objs])?.find((o) => has(u.unwrapObj(o), path))), path);
};
export function findReferences(obj) {
    let results = [];
    (Array.isArray(obj) ? obj : [obj]).forEach((o) => {
        if (u.isStr(o)) {
            if (o.startsWith('.'))
                results.push(o);
        }
        else if (u.isArr(o)) {
            results = results.concat(findReferences(o));
        }
        else if (u.isObj(o)) {
            for (let key in o) {
                const value = o[key];
                results = results.concat(findReferences(key));
                results = results.concat(findReferences(value));
            }
        }
    });
    return results;
}
export function getDataValue(dataObject, dataKey, opts) {
    if (dataObject && typeof dataKey === 'string') {
        if (typeof dataObject === 'object') {
            let dataPath = '';
            if (opts?.iteratorVar && dataKey.startsWith(opts.iteratorVar)) {
                // Strip off the iteratorVar to make the path correctly point to the value
                dataPath = dataKey.split('.').slice(1).join('.');
            }
            else {
                dataPath = dataKey;
            }
            return get(dataObject, dataPath);
        }
    }
}
export const hasNoodlPlaceholder = (function () {
    const regex = new RegExp(`(${Object.values({
        cadlBaseUrl: '\\${cadlBaseUrl}',
        cadlVersion: '\\${cadlVersion}',
        designSuffix: '\\${designSuffix}',
    }).join('|')})`, 'i');
    function hasPlaceholder(str) {
        return u.isStr(str) ? regex.test(str) : false;
    }
    return hasPlaceholder;
})();
export function isOutboundLink(s = '') {
    return /https?:\/\//.test(s);
}
export function isRootDataKey(dataKey) {
    if (typeof dataKey === 'string') {
        if (dataKey.startsWith('.')) {
            dataKey = dataKey.substring(dataKey.search(/[a-zA-Z]/)).trim();
        }
        if (!/^[a-zA-Z]/i.test(dataKey))
            return false;
        if (dataKey)
            return dataKey[0].toUpperCase() === dataKey[0];
    }
    return false;
}
export function isSerializableStr(value) {
    return u.isStr(value) && /^[a-zA-Z]+[0-9]+/.test(value);
}
export function isStable() {
    return process.env.ECOS_ENV === 'stable';
}
export function isTest() {
    return process.env.ECOS_ENV === 'test';
}
export function isValidAsset(value) {
    if (value?.endsWith('..tar'))
        return false;
    return u.isStr(value) && /(.[a-zA-Z]+)$/i.test(value);
}
const regex = {
    prefix: /^[.=@]+/i,
    suffix: /[.=@]+$/i,
};
/**
 * Trims the both prefix and the suffix symbol(s) in the reference string
 * Optionally provide a second parameter with "prefix" to trim only the prefix,
 * and vice versa for the suffix
 *
 * ex: "=.builtIn.string.concat" --> "builtIn.string.concat"
 *
 * ex: "=..builtIn.string.concat" --> "builtIn.string.concat"
 *
 * ex: ".builtIn.string.concat" --> "builtIn.string.concat"
 *
 * ex: "..builtIn.string.concat" --> "builtIn.string.concat"
 *
 * ex: "____.builtIn.string.concat" --> "builtIn.string.concat"
 *
 * ex: "_.builtIn.string.concat" --> "builtIn.string.concat"
 *
 * @param v Reference string
 * @param fixType (Optional) Either "prefix" or "suffix"
 * @returns string
 */
export function trimReference(v, fixType) {
    if (fixType === 'prefix') {
        if (regex.prefix.test(v))
            return v.replace(regex.prefix, '');
        return v;
    }
    if (fixType === 'suffix') {
        if (regex.suffix.test(v))
            return v.replace(regex.suffix, '');
        return v;
    }
    return v.replace(regex.prefix, '').replace(regex.suffix, '') || '';
}
export function withYmlExt(str = '') {
    !str.endsWith('.yml') && (str += '.yml');
    return str;
}
//# sourceMappingURL=noodl-utils.js.map