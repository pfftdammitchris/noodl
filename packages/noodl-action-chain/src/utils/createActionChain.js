"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ActionChain_1 = require("../ActionChain");
function createActionChain(args, actions, loader) {
    let _trigger;
    let _actions = [];
    let _loader;
    if (typeof args === 'string') {
        _trigger = args;
        _actions = actions;
        _loader = loader;
    }
    else {
        _trigger = args.trigger;
        _actions = args.actions;
        _loader = args.loader;
    }
    const actionChain = new ActionChain_1.default(_trigger, _actions, _loader);
    return actionChain;
}
exports.default = createActionChain;
//# sourceMappingURL=createActionChain.js.map