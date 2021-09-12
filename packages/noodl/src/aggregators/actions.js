"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleActionType = exports.visit = void 0;
const yaml_1 = require("yaml");
const visit = (fn) => {
    const visitNode = (key, node, path) => {
        return fn({ key, node, path });
    };
    return visitNode;
};
exports.visit = visit;
exports.handleActionType = exports.visit(({ node }) => {
    //
});
const aggregateActions = function aggregateActions(doc) {
    yaml_1.default.visit(doc, {
        Scalar(key, node, path) {
            //
        },
        Pair(key, node, path) {
            //
        },
        Map(key, node, path) {
            //
        },
        Seq(key, node, path) {
            //
        },
    });
};
exports.default = aggregateActions;
//# sourceMappingURL=actions.js.map