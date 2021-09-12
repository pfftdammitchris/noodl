import { ActionObject, BuiltInActionObject, EvalActionObject, PageJumpActionObject, PopupActionObject, PopupDismissActionObject, RefreshActionObject, SaveActionObject, UpdateActionObject, EventType } from 'noodl-types';
import { LiteralUnion } from 'type-fest';
import { ActionChainInstancesLoader } from '../types';
import ActionChain from '../ActionChain';
export interface MockGetActionChainOptions {
    actions: (ActionObject | MockGetActionChainExtendedActionsArg)[];
    load?: boolean;
    loader?: ActionChainInstancesLoader;
    trigger?: LiteralUnion<EventType, string>;
    use?: Parameters<ActionChain['use']>[0];
}
export interface MockGetActionChainExtendedActionsArg {
    action: ActionObject;
    fn: (...args: any[]) => any;
}
export declare function getActionChain(args: MockGetActionChainOptions): ActionChain<ActionObject<string>, string>;
export declare function getBuiltInAction(props?: Partial<BuiltInActionObject>): BuiltInActionObject;
export declare function getEvalObjectAction(props?: Partial<EvalActionObject>): EvalActionObject;
export declare function getPageJumpAction(props?: Partial<PageJumpActionObject>): PageJumpActionObject;
export declare function getPopUpAction(props?: Partial<PopupActionObject>): PopupActionObject;
export declare function getPopUpDismissAction(props?: Partial<PopupDismissActionObject>): PopupDismissActionObject;
export declare function getRefreshAction(props?: Partial<RefreshActionObject>): RefreshActionObject;
export declare function getSaveObjectAction(props?: Partial<SaveActionObject>): SaveActionObject;
export declare function getUpdateObjectAction(props?: Partial<UpdateActionObject>): {
    actionType: string;
    dataKey?: any;
    dataObject?: any;
    object: {
        '.Global.refid@': string;
    };
};
