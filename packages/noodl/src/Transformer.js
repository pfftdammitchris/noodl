"use strict";
var _Transformer_transducer;
Object.defineProperty(exports, "__esModule", { value: true });
exports._noodlSpecTransformers = void 0;
const tslib_1 = require("tslib");
// @ts-nocheck
const yaml_1 = require("yaml");
const yaml_2 = require("yaml");
const flowRight_1 = require("lodash/flowRight");
const Utils_1 = require("./Utils");
const scalar_1 = require("./utils/scalar");
const u = require("./utils/internal");
exports._noodlSpecTransformers = (function () {
    const createInternalTransformer = (fn) => {
        return function internalTransformer(...args) {
            return fn.call(this, ...args);
        };
    };
    const o = {
        // NOTE: Only use this if the value is intended to be a reference pointing somewhere
        reference: createInternalTransformer(function transformReference(node, util) {
            if (yaml_2.isPair(node)) {
                if (yaml_2.isScalar(node.key) && String(node.key.value).endsWith('@')) {
                    const ref = node.key.value;
                    // Start with the right side first because the reference application
                    // is always determined by its value
                    if (yaml_2.isScalar(node.value) && scalar_1.isReference(node.value)) {
                        console.log('node.value.value', node.value.value);
                        transformReference.call(this, node.value, util);
                        console.log('node.value.value', node.value.value);
                    }
                    // Next, move to the key since the value is resolved
                    node.key.value = ref.substring(0, ref.length - 1);
                    if (yaml_2.isScalar(node.key) && scalar_1.isReference(String(node.key.value))) {
                        transformReference.call(this, node.key, util);
                        return yaml_1.default.visit.SKIP;
                    }
                    if (yaml_2.isScalar(node.value))
                        return yaml_1.default.visit.SKIP;
                }
            }
            else if (yaml_2.isScalar(node) && u.isStr(node.value)) {
                let value;
                if (yaml_2.isScalar(node) && u.isStr(node.value)) {
                    if (node.value.startsWith('..')) {
                        node.value = node.value.substring(2);
                        transformReference.call(this, node, util);
                    }
                    else if (node.value.startsWith('.')) {
                        node.value = node.value.substring(1);
                        transformReference.call(this, node, util);
                    }
                    else if (node.value.startsWith('=')) {
                        node.value = node.value.substring(1);
                        transformReference.call(this, node, util);
                    }
                    else {
                        // node.value = getReference.call(this, node, util)
                        // if (node.value[0] === node.value[0].toUpperCase()) {
                        // 	// If its in another object in the root, the funcs need to reference
                        // 	// their NoodlPage instead in order for getLocalReference to operate
                        // 	// as intended
                        // 	// let [refKey, ...paths] = node.value.split('.')
                        // 	// let refNode
                        // 	// if (util.pages.has(refKey)) {
                        // 	// 	const page = util.pages.get(refKey)
                        // 	// 	if (paths.length) {
                        // 	// 		if (paths.length === 1) node.value = page?.getIn(paths[0])
                        // 	// 		else node.value = page?.getIn(paths)
                        // 	// 	} else {
                        // 	// 		node.value = page?.doc.contents
                        // 	// 	}
                        // 	// } else {
                        // 	// 	refNode = util.root.get(refKey)
                        // 	// 	if (paths.length) {
                        // 	// 		if (u.isMap(refNode)) {
                        // 	// 			node.value = refNode.getIn(paths)
                        // 	// 		} else if (u.isSeq(refNode)) {
                        // 	// 			node.value = refNode.getIn(paths)
                        // 	// 		} else {
                        // 	// 			node.value = get(refNode, paths)
                        // 	// 		}
                        // 	// 	} else {
                        // 	// 		node.value = refNode
                        // 	// 	}
                        // 	// }
                        // 	node.value = getReference.call(this, node, util)
                        // } else if (node.value[0] === node.value[0].toLowerCase()) {
                        // 	node.value = getReference.call(this, node, util)
                        // }
                        if (scalar_1.isReference(node.value)) {
                            transformReference.call(this, node, util);
                        }
                    }
                }
                return value;
            }
        }),
    };
    return o;
})();
class Transformer {
    constructor({ pages, root, util = new Utils_1.default({ pages, root }), }) {
        _Transformer_transducer.set(this, (node) => node);
        this.transforms = [];
        this.pages = pages;
        this.root = root;
        this.util = util;
    }
    get transform() {
        return tslib_1.__classPrivateFieldGet(this, _Transformer_transducer, "f");
    }
    compose(...transforms) {
        const wrapExecute = (fn) => (step) => (node) => {
            fn.call(this, node, this.util);
            return step(node);
        };
        return flowRight_1.default(...transforms.map(wrapExecute))((node) => node);
    }
    createTransform(fn) {
        if (this.transforms.includes(fn))
            return this;
        this.transforms.push(fn);
        tslib_1.__classPrivateFieldSet(this, _Transformer_transducer, this.compose(...this.transforms), "f");
        return this;
    }
}
_Transformer_transducer = new WeakMap();
exports.default = Transformer;
//# sourceMappingURL=Transformer.js.map