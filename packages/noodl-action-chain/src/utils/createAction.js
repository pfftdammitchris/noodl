"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../utils/common");
const Action_1 = require("../Action");
function createAction(args, args2) {
    let trigger;
    let object;
    if (common_1.isString(args) && !common_1.isString(args2) && common_1.isPlainObject(args2)) {
        trigger = args;
        object = args2;
    }
    else if (common_1.isPlainObject(args)) {
        if (!common_1.isString(args) && !('actionType' in args) && 'action' in args) {
            trigger = args.trigger;
            object = args.action;
        }
        else if (!common_1.isString(args) && 'actionType' in args) {
            trigger = args.trigger;
            object = args;
        }
    }
    return new Action_1.default(trigger || '', object);
}
exports.default = createAction;
//# sourceMappingURL=createAction.js.map