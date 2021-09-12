"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateObjectAction = exports.getSaveObjectAction = exports.getRefreshAction = exports.getPopUpDismissAction = exports.getPopUpAction = exports.getPageJumpAction = exports.getEvalObjectAction = exports.getBuiltInAction = exports.getActionChain = void 0;
const ActionChain_1 = require("../ActionChain");
const Action_1 = require("../Action");
function getActionChain(args) {
    const { actions, trigger, loader, load = true, use } = args;
    const isExtendedActions = 'fn' in actions[0] || 'action' in actions[0];
    const getInstance = (obj) => {
        const action = new Action_1.default(trigger, obj);
        if (isExtendedActions) {
            const o = actions.find((o) => o.action === obj);
            // Convenience if they want to provide spies
            typeof o?.fn === 'function' && (action.executor = o.fn);
        }
        return action;
    };
    const ac = new ActionChain_1.default(trigger, (isExtendedActions
        ? actions.map((o) => o.action)
        : actions), (actions) => 
    // @ts-expect-error
    loader ? loader(actions) : actions.map((a) => getInstance(a)));
    use && ac.use(use);
    load && ac.loadQueue();
    return ac;
}
exports.getActionChain = getActionChain;
function getBuiltInAction(props) {
    return { actionType: 'builtIn', funcName: 'hello', ...props };
}
exports.getBuiltInAction = getBuiltInAction;
function getEvalObjectAction(props) {
    return { actionType: 'evalObject', object: {}, ...props };
}
exports.getEvalObjectAction = getEvalObjectAction;
function getPageJumpAction(props) {
    return { actionType: 'pageJump', destination: 'SignIn', ...props };
}
exports.getPageJumpAction = getPageJumpAction;
function getPopUpAction(props) {
    return { actionType: 'popUp', popUpView: 'genderView', ...props };
}
exports.getPopUpAction = getPopUpAction;
function getPopUpDismissAction(props) {
    return { actionType: 'popUpDismiss', popUpView: 'warningView', ...props };
}
exports.getPopUpDismissAction = getPopUpDismissAction;
function getRefreshAction(props) {
    return { actionType: 'refresh', ...props };
}
exports.getRefreshAction = getRefreshAction;
function getSaveObjectAction(props) {
    return { actionType: 'saveObject', object: {}, ...props };
}
exports.getSaveObjectAction = getSaveObjectAction;
function getUpdateObjectAction(props) {
    return {
        actionType: 'updateObject',
        object: { '.Global.refid@': '___.itemObject.id' },
        ...props,
    };
}
exports.getUpdateObjectAction = getUpdateObjectAction;
//# sourceMappingURL=helpers.js.map