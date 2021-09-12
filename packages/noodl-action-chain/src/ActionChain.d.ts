import { ActionObject } from 'noodl-types';
import AbortExecuteError from './AbortExecuteError';
import Action from './Action';
import { ActionChainInstancesLoader, ActionChainIteratorResult, ActionChainStatus, ActionChainObserver } from './types';
declare class ActionChain<A extends ActionObject = ActionObject, T extends string = string> {
    #private;
    data: Map<any, any>;
    trigger: T;
    /**
     * Creates an asynchronous generator that generates the next immediate action
     * when the previous has ended
     */
    static createGenerator<A extends ActionObject, T extends string>(inst: ActionChain): AsyncGenerator<Action<A["actionType"], T>, ActionChainIteratorResult<A, T>[], any>;
    constructor(trigger: T, actions: A[], loader?: ActionChainInstancesLoader<A, T>);
    get actions(): A[];
    get current(): Action<A["actionType"], T> | null;
    get injected(): Action<A["actionType"], T>[];
    get queue(): Action<A["actionType"], T>[];
    set loader(loader: ActionChainInstancesLoader<A, T> | undefined);
    /**
     * Aborts the action chain from executing further
     * @param { string | string[] | undefined } reason
     */
    abort(_reason?: string | string[]): Promise<ActionChainIteratorResult<A, T>[]>;
    clear(): void;
    execute(args?: any, { timeout }?: {
        timeout?: number;
    }): Promise<ActionChainIteratorResult<A, T>[]>;
    inject(action: A | ActionObject): Action<A["actionType"], T>;
    isAborted(): boolean;
    /**
     * Converts one or more raw action objects to their instances and returns them.
     * If a loader was provided in the constructor, it will delegate to that function
     * to provide the instances
     */
    load(action: A | ActionObject): Action<A['actionType'], T>;
    load(actions: (A | ActionObject)[]): Action<A['actionType'], T>[];
    /**
     * Loads the queue by converting actions into their instances. If a loader
     * was provided in the constructor, it will use that function to load the queue
     */
    loadQueue(): Action<A["actionType"], T>[];
    /**
     * Runs the next async iterator result as { done, value }
     * @param { any } callerResult - Result of previous call passes as arguments to the generator yielder
     */
    next(callerResult?: any): Promise<IteratorResult<Action<A["actionType"], T>, ActionChainIteratorResult<A, T>[]>>;
    /** Returns a snapshot of the overall state */
    snapshot<SnapshotResult extends Record<string, any>>(opts?: SnapshotResult): {
        abortReason: string | string[] | undefined;
        actions: A[];
        data: any[];
        error: Error | AbortExecuteError | null;
        current: Action<A["actionType"], T> | null;
        injected: Action<A["actionType"], T>[];
        queue: {
            actionType: A["actionType"];
            error: Error | AbortExecuteError | null;
            executed: boolean;
            hasExecutor: boolean;
            id: string;
            original: ActionObject<A["actionType"]>;
            remaining: number;
            receivedResult: boolean;
            status: import("./types").ActionStatus | null;
            trigger: T;
            timeout: number;
        }[];
        results: ActionChainIteratorResult<A, T>[];
        status: ActionChainStatus;
        trigger: T;
    } & SnapshotResult;
    use(obj?: Partial<ActionChainObserver>): this;
}
export default ActionChain;
