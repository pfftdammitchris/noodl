"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorResponse = exports.getSuccessResponse = exports.throwError = exports.is = exports.purgeRootConfig = exports.logError = exports.createVisitor = void 0;
const u = require("@jsmanifest/utils");
const nu = require("noodl-utils");
const yaml_1 = require("yaml");
const createVisitor = function (visitor) {
    if (u.isFnc(visitor)) {
        return { Node: visitor };
    }
    return u.reduce(u.entries(visitor), (acc, [key, fn]) => u.assign(acc, { [key]: fn }), {});
};
exports.createVisitor = createVisitor;
function logError(error) {
    if (error instanceof Error) {
        console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`, '\n' + error.stack?.split('\n').slice(1).join('\n'));
    }
    else {
        console.error(new Error(String(error)));
    }
}
exports.logError = logError;
function purgeRootConfig(rootConfig, replacer = nu.createNoodlPlaceholderReplacer({
    cadlBaseUrl: rootConfig.get('cadlBaseUrl'),
    cadlVersion: rootConfig.getIn(['web', 'cadlVersion', 'test']),
    designSuffix: rootConfig.get('designSuffix'),
})) {
    yaml_1.visit(rootConfig, function visitRootConfig(key, node, path) {
        if (yaml_1.isScalar(node) &&
            u.isStr(node.value) &&
            nu.hasNoodlPlaceholder(node.value)) {
            node.value = replacer(node.value);
        }
    });
    return rootConfig;
}
exports.purgeRootConfig = purgeRootConfig;
function onScalar(fn) {
    return (node) => yaml_1.isScalar(node) && fn(node);
}
function onPair(fn) {
    return (node) => yaml_1.isPair(node) && fn(node);
}
function onMap(fn) {
    return (node) => yaml_1.isMap(node) && fn(node);
}
function onSeq(fn) {
    return (node) => yaml_1.isSeq(node) && fn(node);
}
exports.is = {
    scalar: {
        actionType: onScalar((node) => node.value === 'actionType'),
    },
    pair: {
        actionType: onPair((node) => yaml_1.isScalar(node.key) && node.key.value === 'actionType'),
    },
    map: {
        action: onMap((node) => node.has('actionType')),
        component: onMap((node) => node.has('type') && (node.has('style') || node.has('children'))),
        emit: onMap((node) => node.has('emit')),
        goto: onMap((node) => node.has('goto')),
    },
    seq: {},
};
function throwError(err) {
    if (err instanceof Error)
        throw err;
    throw new Error(String(err));
}
exports.throwError = throwError;
function getSuccessResponse(body, options) {
    return {
        statusCode: 200,
        body: body ? JSON.stringify(body, null, 2) : '',
        ...options,
    };
}
exports.getSuccessResponse = getSuccessResponse;
function getErrorResponse(error, options) {
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
exports.getErrorResponse = getErrorResponse;
//# sourceMappingURL=utils.js.map