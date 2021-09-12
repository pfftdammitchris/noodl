"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const utils_1 = require("../../utils");
const { isDocument, isScalar, isPair, isMap, isSeq } = yaml_1.default;
const actionsVisitor = (aggregator, options) => {
    const enabledFeatures = {
        actionTypes: !!options?.actionTypes,
        actionObjects: !!options?.actionObjects,
        actionsStats: !!options?.actionsStats,
    };
    const context = {};
    for (const [key, value] of u.entries(enabledFeatures)) {
        if (key === 'actionTypes' && value)
            context.actionTypes = [];
        if (key === 'actionObjects' && value)
            context.actionObjects = [];
        if (key === 'actionsStats' && value)
            context.actionsStats = {};
    }
    return {
        context,
        visit: {
            Pair: ({ node }, { actionTypes }) => {
                if (enabledFeatures.actionTypes) {
                    if (utils_1.is.scalar.actionType(node.key) && isScalar(node.value)) {
                        const actionType = node.value.value;
                        if (!actionTypes.includes(actionType)) {
                            actionTypes.push(actionType);
                        }
                    }
                }
            },
            Map: ({ node }, { actionObjects, actionsStats }) => {
                if (node?.has('actionType')) {
                    if (enabledFeatures.actionObjects) {
                        actionObjects.push(node.toJSON());
                    }
                    if (enabledFeatures.actionsStats) {
                        const actionType = node.get('actionType');
                        if (!u.isNum(actionsStats[actionType])) {
                            actionsStats[actionType] = 0;
                        }
                        if (actionType === 'builtIn') {
                            const funcName = node.get('funcName');
                            if (!u.isNum(actionsStats.builtIn[funcName])) {
                                actionsStats.builtIn[funcName] = 0;
                            }
                            actionsStats.builtIn[funcName]++;
                            actionsStats.builtIn.total++;
                        }
                        else {
                            actionsStats[actionType]++;
                        }
                    }
                }
            },
        },
    };
};
exports.default = actionsVisitor;
//# sourceMappingURL=actionsVisitor.js.map