import * as u from '@jsmanifest/utils';
import flowRight from 'lodash/flowRight.js';
import curry from 'lodash/curry.js';
import { isDocument, isMap, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';
import { placeholder } from '../constants.js';
export function has(path, node) {
    if (isYAMLNode('map', node)) {
        if (u.isStr(path)) {
            return node.hasIn(path.split('.'));
        }
        else if (u.isArr(path)) {
            return node.hasIn(path);
        }
    }
    return false;
}
export const hasNoodlPlaceholder = (function () {
    const regex = new RegExp(`(${u.values(placeholder).join('|')})`, 'i');
    function hasPlaceholder(str) {
        return u.isStr(str) ? regex.test(str) : false;
    }
    return hasPlaceholder;
})();
export function hasPaths(paths, node) {
    if (isYAMLNode('map', node)) {
        if (u.isObj(paths)) {
            const required = paths.required;
            paths = paths.paths;
            if (required?.length) {
                if (required.every((path) => node.hasIn(path))) {
                    return true;
                }
                else {
                    // As a fallback we can still assume true if it has at least these paths:
                    return paths.every((path) => node.hasIn(path));
                }
            }
            else {
                return paths.every((path) => node.hasIn(path));
            }
        }
        else if (Array.isArray(paths)) {
            return paths.every((p) => node.hasIn(p));
        }
    }
    return false;
}
export function isValidAsset(value) {
    if (value?.endsWith('..tar'))
        return false;
    return u.isStr(value) && /(.[a-zA-Z]+)$/i.test(value);
}
export function isActionObj(node) {
    return has('actionType', node);
}
export function isBuiltInObj(node) {
    return node.get('actionType') === 'builtIn';
}
export function isComponentObj(node) {
    return has('type', node);
}
export function isEmitObj(node) {
    return has('emit', node);
}
export function isIfObj(node) {
    return has('if', node);
}
export function isPageDocument(node) {
    return (isDocument(node) && isMap(node.contents) && node.contents.items.length === 1);
}
export function isYAMLNode(type, node) {
    if (node) {
        switch (type) {
            case 'map':
                return node instanceof YAMLMap;
            case 'scalar':
                return node instanceof Scalar;
            case 'pair':
                return node instanceof Pair;
            case 'seq':
                return node instanceof YAMLSeq;
        }
    }
    return false;
}
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
export const replaceBaseUrlPlaceholder = createPlaceholderReplacer('\\${cadlBaseUrl}', 'gi');
export const replaceDesignSuffixPlaceholder = createPlaceholderReplacer('\\${designSuffix}', 'gi');
export const replaceTildePlaceholder = createPlaceholderReplacer('~/');
export const replaceVersionPlaceholder = createPlaceholderReplacer('\\${cadlVersion}', 'gi');
export const createNoodlPlaceholderReplacer = (function () {
    const replaceCadlBaseUrl = curry(replaceBaseUrlPlaceholder);
    const replaceCadlVersion = curry(replaceVersionPlaceholder);
    const replaceDesignSuffix = curry(replaceDesignSuffixPlaceholder);
    const replacerMapper = {
        cadlVersion: replaceCadlVersion,
        designSuffix: replaceDesignSuffix,
        cadlBaseUrl: replaceCadlBaseUrl,
    };
    const createReplacer = (keyMap) => {
        const replacers = [];
        const entries = u.entries(keyMap);
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
//# sourceMappingURL=noodl-utils.js.map