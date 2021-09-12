"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const utils_js_1 = require("../../utils.js");
const componentsVisitor = (aggregator, options) => {
    const enabledFeatures = {
        componentTypes: !!options?.componentTypes,
        componentObjects: !!options?.componentObjects,
        componentsStats: !!options?.componentsStats,
    };
    const context = {};
    for (const [key, value] of u.entries(enabledFeatures)) {
        if (key === 'componentTypes' && value)
            context.componentTypes = [];
        if (key === 'componentObjects' && value)
            context.componentObjects = [];
        if (key === 'componentsStats' && value)
            context.componentsStats = {};
    }
    return {
        context,
        visit: {
            Map: ({ node }, { componentTypes, componentObjects, componentsStats }) => {
                if (utils_js_1.is.map.component(node)) {
                    const componentType = node.get('type');
                    const componentObject = node.toJSON();
                    if (enabledFeatures.componentTypes) {
                        if (!componentTypes.includes(componentType)) {
                            componentTypes.push(componentType);
                        }
                    }
                    if (enabledFeatures.componentsStats) {
                        if (!u.isNum(componentsStats[componentType])) {
                            componentsStats[componentType] = 0;
                        }
                        componentsStats[componentType]++;
                    }
                    if (enabledFeatures.componentObjects) {
                        componentObjects.push(componentObject);
                    }
                }
            },
        },
    };
};
exports.default = componentsVisitor;
//# sourceMappingURL=componentsVisitor.js.map