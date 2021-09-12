import { ActionObject } from 'noodl-types';
import AbortExecuteError from './AbortExecuteError';
import * as c from './constants';
export interface IAction<AType extends string = string, T extends string = string> {
    actionType: AType;
    abort(reason?: string | string[]): void;
    aborted: boolean;
    execute(...args: any[]): Promise<any>;
    executor(...args: any[]): Promise<any>;
    executed: boolean;
    original: ActionObject<AType>;
    result: any;
    trigger: T;
}
export declare type ActionStatus = typeof c.ABORTED | typeof c.ERROR | typeof c.PENDING | typeof c.RESOLVED | typeof c.TIMED_OUT;
export declare type ActionChainStatus = typeof c.IDLE | typeof c.IN_PROGRESS | typeof c.ABORTED | typeof c.ERROR;
export declare type ActionChainIteratorResult<A extends ActionObject = ActionObject, T extends string = string> = {
    action: IAction<A['actionType'], T>;
    result: any;
};
export interface ActionChainInstancesLoader<A extends ActionObject = ActionObject, RT = IAction<A['actionType']>> {
    (actions: A[]): RT[];
}
export interface ActionChainObserver<A extends ActionObject = ActionObject> {
    onAbortStart?: (...args: any[]) => any;
    onAbortEnd?: (...args: any[]) => any;
    onAbortError?(args: {
        action: IAction<A['actionType']>;
        error: Error;
    }): void;
    onBeforeAbortAction?(args: {
        action: IAction<A['actionType']>;
        queue: IAction[];
    }): void;
    onAfterAbortAction?(args: {
        action: IAction<A['actionType']>;
        queue: IAction[];
    }): void;
    onExecuteStart?: (...args: any[]) => any;
    onExecuteEnd?: (...args: any[]) => any;
    onExecuteError?: (current: IAction, error: Error | AbortExecuteError) => any;
    onExecuteResult?: (result?: any) => any;
    onBeforeActionExecute?(args: {
        action: IAction<A['actionType']>;
        args?: any;
    }): void;
    onRefresh?: (...args: any[]) => any;
    onBeforeInject?: (action: A | ActionObject) => any;
    onAfterInject?: (action: A | ActionObject, instance: IAction<ActionObject['actionType']>) => any;
}