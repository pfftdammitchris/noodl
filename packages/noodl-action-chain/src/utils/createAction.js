import { isString, isPlainObject } from '../utils/common';
import Action from '../Action';
function createAction(args, args2) {
    let trigger;
    let object;
    if (isString(args) && !isString(args2) && isPlainObject(args2)) {
        trigger = args;
        object = args2;
    }
    else if (isPlainObject(args)) {
        if (!isString(args) && !('actionType' in args) && 'action' in args) {
            trigger = args.trigger;
            object = args.action;
        }
        else if (!isString(args) && 'actionType' in args) {
            trigger = args.trigger;
            object = args;
        }
    }
    return new Action(trigger || '', object);
}
export default createAction;
//# sourceMappingURL=createAction.js.map