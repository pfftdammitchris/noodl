import { ActionObject } from 'noodl-types';
import Action from '../Action';
declare function createAction<AType extends string, T extends string>(args: {
    action: ActionObject<AType>;
    trigger: T;
}, _?: never): Action<AType, T>;
declare function createAction<AType extends string, T extends string>(action: ActionObject<AType>): Action<AType, T>;
declare function createAction<AType extends string, T extends string>(trigger: T, action: ActionObject<AType>): Action<AType, T>;
export default createAction;
