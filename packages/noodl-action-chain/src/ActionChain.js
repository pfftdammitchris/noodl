"use strict";
var _ActionChain_abortReason, _ActionChain_actions, _ActionChain_current, _ActionChain_error, _ActionChain_gen, _ActionChain_injected, _ActionChain_loader, _ActionChain_obs, _ActionChain_queue, _ActionChain_results, _ActionChain_status, _ActionChain_timeout, _ActionChain_refresh, _ActionChain_setStatus;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const AbortExecuteError_1 = require("./AbortExecuteError");
const Action_1 = require("./Action");
const createAction_1 = require("./utils/createAction");
const common_1 = require("./utils/common");
const c = require("./constants");
class ActionChain {
    constructor(trigger, actions, loader) {
        _ActionChain_abortReason.set(this, void 0);
        _ActionChain_actions.set(this, void 0);
        _ActionChain_current.set(this, null);
        _ActionChain_error.set(this, null);
        _ActionChain_gen.set(this, {});
        _ActionChain_injected.set(this, []);
        _ActionChain_loader.set(this, void 0);
        _ActionChain_obs.set(this, {});
        _ActionChain_queue.set(this, []);
        _ActionChain_results.set(this, []);
        _ActionChain_status.set(this, c.IDLE);
        _ActionChain_timeout.set(this, null);
        this.data = new Map();
        _ActionChain_refresh.set(this, () => {
            tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f") && clearTimeout(tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f"));
            this.loadQueue();
            tslib_1.__classPrivateFieldGet(this, _ActionChain_setStatus, "f").call(this, c.IDLE);
            tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onRefresh?.();
        });
        _ActionChain_setStatus.set(this, (status, arg) => {
            if (status === c.IDLE) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_status, c.IDLE, "f");
            }
            else if (status === c.IN_PROGRESS) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_status, c.IN_PROGRESS, "f");
            }
            else if (status === c.ABORTED) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_status, c.ABORTED, "f");
                if (common_1.isArray(arg) && arg.length > 1) {
                    tslib_1.__classPrivateFieldSet(this, _ActionChain_abortReason, arg, "f");
                }
                else if (common_1.isArray(arg)) {
                    tslib_1.__classPrivateFieldSet(this, _ActionChain_abortReason, arg[0], "f");
                }
                else if (common_1.isString(arg)) {
                    tslib_1.__classPrivateFieldSet(this, _ActionChain_abortReason, arg, "f");
                }
            }
            else if (status === c.ERROR) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_status, c.ERROR, "f");
                tslib_1.__classPrivateFieldSet(this, _ActionChain_error, arg, "f");
            }
            return this;
        }
        /** Returns a snapshot of the overall state */
        );
        this.trigger = trigger;
        tslib_1.__classPrivateFieldSet(this, _ActionChain_actions, actions, "f");
        tslib_1.__classPrivateFieldSet(this, _ActionChain_loader, loader, "f");
    }
    /**
     * Creates an asynchronous generator that generates the next immediate action
     * when the previous has ended
     */
    static async *createGenerator(inst) {
        let action;
        let results = [];
        let result;
        while (inst.queue.length) {
            action = inst.queue.shift();
            result = inst.isAborted() ? undefined : await (yield action);
            results.push({ action, result });
        }
        return results;
    }
    [(_ActionChain_abortReason = new WeakMap(), _ActionChain_actions = new WeakMap(), _ActionChain_current = new WeakMap(), _ActionChain_error = new WeakMap(), _ActionChain_gen = new WeakMap(), _ActionChain_injected = new WeakMap(), _ActionChain_loader = new WeakMap(), _ActionChain_obs = new WeakMap(), _ActionChain_queue = new WeakMap(), _ActionChain_results = new WeakMap(), _ActionChain_status = new WeakMap(), _ActionChain_timeout = new WeakMap(), _ActionChain_refresh = new WeakMap(), _ActionChain_setStatus = new WeakMap(), Symbol.for('nodejs.util.inspect.custom'))]() {
        return this.snapshot();
    }
    get actions() {
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_actions, "f");
    }
    get current() {
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_current, "f");
    }
    get injected() {
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_injected, "f");
    }
    get queue() {
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f");
    }
    set loader(loader) {
        tslib_1.__classPrivateFieldSet(this, _ActionChain_loader, loader, "f");
    }
    /**
     * Aborts the action chain from executing further
     * @param { string | string[] | undefined } reason
     */
    async abort(_reason) {
        tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onAbortStart?.();
        let reason;
        if (_reason) {
            if (common_1.isArray(_reason) && _reason.length > 1)
                _reason.push(..._reason);
            else if (common_1.isArray(_reason))
                reason = _reason[0];
            else if (_reason)
                reason = _reason;
        }
        tslib_1.__classPrivateFieldGet(this, _ActionChain_setStatus, "f").call(this, c.ABORTED, reason);
        // The loop below should handle the current pending action. Since this.current is never
        // in the queue, we have to insert it back to the list for the while loop to pick it up
        if (this.current && !this.current.executed) {
            tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").unshift(this.current);
        }
        // Exhaust the remaining actions in the queue and abort them
        while (tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").length) {
            const action = tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").shift();
            if (action && action.status !== 'aborted') {
                try {
                    tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onBeforeAbortAction?.({ action, queue: tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f") });
                    action?.abort(reason || '');
                    tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onAfterAbortAction?.({ action, queue: tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f") });
                }
                catch (error) {
                    tslib_1.__classPrivateFieldSet(this, _ActionChain_error, error, "f");
                    tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onAbortError?.({ action, error: error });
                }
                finally {
                    tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f").push({
                        action,
                        result: new AbortExecuteError_1.default('Aborted from calling the abort method'),
                    });
                }
            }
        }
        tslib_1.__classPrivateFieldSet(this, _ActionChain_current, null, "f");
        tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onAbortEnd?.();
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f");
    }
    clear() {
        this.data.clear();
        tslib_1.__classPrivateFieldSet(this, _ActionChain_current, null, "f");
        tslib_1.__classPrivateFieldGet(this, _ActionChain_actions, "f").length = 0;
        tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").length = 0;
        tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f").length = 0;
        tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f") && clearTimeout(tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f"));
        tslib_1.__classPrivateFieldGet(this, _ActionChain_error, "f") && (tslib_1.__classPrivateFieldSet(this, _ActionChain_error, null, "f"));
        Object.keys(tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f")).forEach((key) => delete tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f")[key]);
    }
    async execute(args, { timeout = 10000 } = {}) {
        try {
            tslib_1.__classPrivateFieldSet(this, _ActionChain_results, [], "f");
            tslib_1.__classPrivateFieldGet(this, _ActionChain_setStatus, "f").call(this, c.IN_PROGRESS);
            tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onExecuteStart?.();
            let action;
            let iterator;
            let result;
            // Initiates the generator (note: this first invocation does not execute
            // any actions, it steps into it so the actual execution of actions
            // begins at the second call to this.next)
            iterator = await this.next();
            if (iterator) {
                while (!iterator?.done) {
                    try {
                        if (tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f"))
                            clearTimeout(tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f"));
                        // Cache the reference since it could be changed when setTimeout fires
                        let cachedAction = action;
                        tslib_1.__classPrivateFieldSet(this, _ActionChain_timeout, setTimeout(() => {
                            const msg = `Action of type "${cachedAction?.actionType}" timed out`;
                            cachedAction?.abort?.(msg);
                            cachedAction = null;
                            try {
                                this.abort(msg);
                            }
                            catch (error) {
                                throw new AbortExecuteError_1.default(error.message);
                            }
                        }, timeout), "f");
                        if (iterator) {
                            if (!iterator.done) {
                                action = iterator?.value;
                                if (action?.status !== 'aborted') {
                                    tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onBeforeActionExecute?.({ action, args });
                                    result = await action?.execute?.(args);
                                    tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onExecuteResult?.(result);
                                    tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f").push({
                                        action: action,
                                        result: action?.result,
                                    });
                                    iterator = await this.next?.(result);
                                }
                            }
                        }
                        else {
                            await this.abort(`Expected an iterator to be returned but received ${typeof iterator} instead`);
                        }
                        // iterator = await this.next(result)
                        // if (!iterator?.done) {
                        // 	action = iterator?.value as Action<A['actionType'], T>
                        // }
                        if (common_1.isPlainObject(result) && 'wait' in result) {
                            // This block is mostly intended for popUps to "wait" for a user interaction
                            await this?.abort?.(`An action returned from a "${action?.actionType}" type requested to wait`);
                        }
                    }
                    catch (error) {
                        tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onExecuteError?.(this.current, error);
                        // TODO - replace throw with appending the error to the result item instead
                        throw error;
                    }
                    finally {
                        tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f") && clearTimeout(tslib_1.__classPrivateFieldGet(this, _ActionChain_timeout, "f"));
                    }
                }
            }
        }
        catch (error) {
            await this.abort?.(error.message);
            // throw new AbortExecuteError(error.message)
        }
        finally {
            tslib_1.__classPrivateFieldGet(this, _ActionChain_refresh, "f")?.call(this);
            tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onExecuteEnd?.();
        }
        return tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f");
    }
    inject(action) {
        tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onBeforeInject?.(action);
        const inst = this.load(action);
        tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").unshift(inst);
        tslib_1.__classPrivateFieldGet(this, _ActionChain_injected, "f").push(inst);
        tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f").onAfterInject?.(action, inst);
        return inst;
    }
    isAborted() {
        if (tslib_1.__classPrivateFieldGet(this, _ActionChain_status, "f") === c.ABORTED)
            return true;
        return false;
    }
    load(arg) {
        if (common_1.isArray(arg)) {
            return (tslib_1.__classPrivateFieldGet(this, _ActionChain_loader, "f")?.call(this, arg) ||
                arg.map((o) => createAction_1.default(this.trigger, o)));
        }
        else if (tslib_1.__classPrivateFieldGet(this, _ActionChain_loader, "f")) {
            return tslib_1.__classPrivateFieldGet(this, _ActionChain_loader, "f").call(this, [arg])[0];
        }
        return createAction_1.default(this.trigger, arg);
    }
    /**
     * Loads the queue by converting actions into their instances. If a loader
     * was provided in the constructor, it will use that function to load the queue
     */
    loadQueue() {
        let actions = tslib_1.__classPrivateFieldGet(this, _ActionChain_loader, "f")?.call(this, this.actions) || [];
        if (!Array.isArray(actions))
            actions = [actions];
        //
        actions.forEach((action, index) => (tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f")[index] = action));
        if (tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").length > actions.length) {
            while (tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").length > actions.length)
                tslib_1.__classPrivateFieldGet(this, _ActionChain_queue, "f").pop();
        }
        // @ts-expect-error
        tslib_1.__classPrivateFieldSet(this, _ActionChain_gen, ActionChain.createGenerator(this), "f");
        return this.queue;
    }
    /**
     * Runs the next async iterator result as { done, value }
     * @param { any } callerResult - Result of previous call passes as arguments to the generator yielder
     */
    async next(callerResult) {
        const result = await tslib_1.__classPrivateFieldGet(this, _ActionChain_gen, "f")?.next(callerResult);
        if (result) {
            if (!result.done && result.value instanceof Action_1.default) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_current, result.value, "f");
            }
            if (result.done) {
                tslib_1.__classPrivateFieldSet(this, _ActionChain_current, null, "f");
            }
        }
        return result;
    }
    /** Returns a snapshot of the overall state */
    snapshot(opts) {
        const snapshot = {
            abortReason: tslib_1.__classPrivateFieldGet(this, _ActionChain_abortReason, "f"),
            actions: this.actions,
            data: Array.from(this.data.values()),
            error: tslib_1.__classPrivateFieldGet(this, _ActionChain_error, "f"),
            current: this.current,
            injected: tslib_1.__classPrivateFieldGet(this, _ActionChain_injected, "f"),
            queue: this.queue.map((o) => o.snapshot()),
            results: tslib_1.__classPrivateFieldGet(this, _ActionChain_results, "f"),
            status: tslib_1.__classPrivateFieldGet(this, _ActionChain_status, "f"),
            trigger: this.trigger,
            ...opts,
        };
        return snapshot;
    }
    use(obj) {
        if (common_1.isPlainObject(obj)) {
            Object.entries(obj).forEach(([evt, fn]) => (tslib_1.__classPrivateFieldGet(this, _ActionChain_obs, "f")[evt] = fn));
        }
        return this;
    }
}
exports.default = ActionChain;
//# sourceMappingURL=ActionChain.js.map