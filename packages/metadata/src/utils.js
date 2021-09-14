import * as u from '@jsmanifest/utils';
import * as nu from 'noodl-utils';
import { isScalar, isPair, isMap, isSeq, visit as visitFn, } from 'yaml';
export const createVisitor = function (visitor) {
    if (u.isFnc(visitor)) {
        return { Node: visitor };
    }
    return u.reduce(u.entries(visitor), (acc, [key, fn]) => u.assign(acc, { [key]: fn }), {});
};
export function logError(error) {
    if (error instanceof Error) {
        console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`, '\n' + error.stack?.split('\n').slice(1).join('\n'));
    }
    else {
        console.error(new Error(String(error)));
    }
}
export function purgeRootConfig(rootConfig, replacer = nu.createNoodlPlaceholderReplacer({
    cadlBaseUrl: rootConfig.get('cadlBaseUrl'),
    cadlVersion: rootConfig.getIn(['web', 'cadlVersion', 'test']),
    designSuffix: rootConfig.get('designSuffix'),
})) {
    visitFn(rootConfig, function visitRootConfig(key, node, path) {
        if (isScalar(node) &&
            u.isStr(node.value) &&
            nu.hasNoodlPlaceholder(node.value)) {
            node.value = replacer(node.value);
        }
    });
    return rootConfig;
}
function onScalar(fn) {
    return (node) => isScalar(node) && fn(node);
}
function onPair(fn) {
    return (node) => isPair(node) && fn(node);
}
function onMap(fn) {
    return (node) => isMap(node) && fn(node);
}
function onSeq(fn) {
    return (node) => isSeq(node) && fn(node);
}
export const is = {
    scalar: {
        actionType: onScalar((node) => node.value === 'actionType'),
    },
    pair: {
        actionType: onPair((node) => isScalar(node.key) && node.key.value === 'actionType'),
    },
    map: {
        action: onMap((node) => node.has('actionType')),
        component: onMap((node) => node.has('type') && (node.has('style') || node.has('children'))),
        emit: onMap((node) => node.has('emit')),
        goto: onMap((node) => node.has('goto')),
    },
    seq: {},
};
export function throwError(err) {
    if (err instanceof Error)
        throw err;
    throw new Error(String(err));
}
export function getSuccessResponse(body, options) {
    return {
        statusCode: 200,
        body: body ? JSON.stringify(body, null, 2) : '',
        ...options,
    };
}
export function getErrorResponse(error, options) {
    return {
        statusCode: 500,
        body: JSON.stringify(error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                ...(process.env.NODE_ENV === 'development'
                    ? { stack: error.stack }
                    : undefined),
            }
            : { name: 'Error', message: String(error) }, null, 2),
        ...options,
    };
}
//# sourceMappingURL=utils.js.map