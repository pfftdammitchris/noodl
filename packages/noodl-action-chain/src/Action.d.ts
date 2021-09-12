import { ActionObject } from 'noodl-types';
import { ActionStatus, IAction } from './types';
import AbortExecuteError from './AbortExecuteError';
declare class Action<AType extends string = string, T extends string = string> implements IAction<AType, T> {
    #private;
    error: AbortExecuteError | Error | null;
    hasExecutor: boolean;
    result: any;
    receivedResult: boolean;
    timeout: number;
    constructor(trigger: T, action: ActionObject<AType>);
    get actionType(): AType;
    get aborted(): boolean;
    get executed(): boolean;
    get executor(): (...args: any[]) => Promise<any>;
    set executor(executor: (...args: any[]) => Promise<any>);
    get id(): string;
    get original(): ActionObject<AType>;
    get trigger(): T;
    get status(): ActionStatus | null;
    set status(status: ActionStatus | null);
    abort(reason: string | string[]): void;
    clearTimeout(): void;
    clearInterval(): void;
    /**
     * Executes the callback that is registered to this action, optionally
     * passing in any additional arguments
     * @param { any } args - Arguments passed to the executor function
     */
    execute<Args extends any[]>(...args: Args): Promise<any>;
    snapshot(): {
        actionType: AType;
        error: Error | AbortExecuteError | null;
        executed: boolean;
        hasExecutor: boolean;
        id: string;
        original: ActionObject<AType>;
        remaining: number;
        receivedResult: boolean;
        status: ActionStatus | null;
        trigger: T;
        timeout: number;
    };
    toString(): string;
}
export default Action;
