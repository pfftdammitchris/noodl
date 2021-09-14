import ActionChain from '../ActionChain';
import Action from '../Action';
export function getActionChain(args) {
    const { actions, trigger, loader, load = true, use } = args;
    const isExtendedActions = 'fn' in actions[0] || 'action' in actions[0];
    const getInstance = (obj) => {
        const action = new Action(trigger, obj);
        if (isExtendedActions) {
            const o = actions.find((o) => o.action === obj);
            // Convenience if they want to provide spies
            typeof o?.fn === 'function' && (action.executor = o.fn);
        }
        return action;
    };
    const ac = new ActionChain(trigger, (isExtendedActions
        ? actions.map((o) => o.action)
        : actions), (actions) => 
    // @ts-expect-error
    loader ? loader(actions) : actions.map((a) => getInstance(a)));
    use && ac.use(use);
    load && ac.loadQueue();
    return ac;
}
export function getBuiltInAction(props) {
    return { actionType: 'builtIn', funcName: 'hello', ...props };
}
export function getEvalObjectAction(props) {
    return { actionType: 'evalObject', object: {}, ...props };
}
export function getPageJumpAction(props) {
    return { actionType: 'pageJump', destination: 'SignIn', ...props };
}
export function getPopUpAction(props) {
    return { actionType: 'popUp', popUpView: 'genderView', ...props };
}
export function getPopUpDismissAction(props) {
    return { actionType: 'popUpDismiss', popUpView: 'warningView', ...props };
}
export function getRefreshAction(props) {
    return { actionType: 'refresh', ...props };
}
export function getSaveObjectAction(props) {
    return { actionType: 'saveObject', object: {}, ...props };
}
export function getUpdateObjectAction(props) {
    return {
        actionType: 'updateObject',
        object: { '.Global.refid@': '___.itemObject.id' },
        ...props,
    };
}
//# sourceMappingURL=helpers.js.map