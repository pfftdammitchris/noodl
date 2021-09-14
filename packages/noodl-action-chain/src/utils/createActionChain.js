import ActionChain from '../ActionChain';
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
    const actionChain = new ActionChain(_trigger, _actions, _loader);
    return actionChain;
}
export default createActionChain;
//# sourceMappingURL=createActionChain.js.map