"use strict";
var _Action_id, _Action_actionType, _Action_aborted, _Action_executed, _Action_executor, _Action_original, _Action_remaining, _Action_status, _Action_timeout, _Action_trigger, _Action_interval;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("./utils/common");
const AbortExecuteError_1 = require("./AbortExecuteError");
const c = require("./constants");
const DEFAULT_TIMEOUT = 8000;
class Action {
    constructor(trigger, action) {
        _Action_id.set(this, void 0);
        _Action_actionType.set(this, void 0);
        _Action_aborted.set(this, false);
        _Action_executed.set(this, false);
        _Action_executor.set(this, {});
        _Action_original.set(this, void 0);
        _Action_remaining.set(this, Infinity);
        _Action_status.set(this, null);
        _Action_timeout.set(this, null);
        _Action_trigger.set(this, void 0);
        _Action_interval.set(this, null);
        this.error = null;
        this.hasExecutor = false;
        this.receivedResult = false;
        this.timeout = DEFAULT_TIMEOUT;
        tslib_1.__classPrivateFieldSet(this, _Action_id, common_1.createId(), "f");
        tslib_1.__classPrivateFieldSet(this, _Action_original, action, "f");
        tslib_1.__classPrivateFieldSet(this, _Action_trigger, trigger, "f");
        tslib_1.__classPrivateFieldSet(this, _Action_actionType, action.actionType, "f");
    }
    [(_Action_id = new WeakMap(), _Action_actionType = new WeakMap(), _Action_aborted = new WeakMap(), _Action_executed = new WeakMap(), _Action_executor = new WeakMap(), _Action_original = new WeakMap(), _Action_remaining = new WeakMap(), _Action_status = new WeakMap(), _Action_timeout = new WeakMap(), _Action_trigger = new WeakMap(), _Action_interval = new WeakMap(), Symbol.for('nodejs.util.inspect.custom'))]() {
        return this.snapshot();
    }
    get actionType() {
        return tslib_1.__classPrivateFieldGet(this, _Action_actionType, "f");
    }
    get aborted() {
        return tslib_1.__classPrivateFieldGet(this, _Action_aborted, "f");
    }
    get executed() {
        return tslib_1.__classPrivateFieldGet(this, _Action_executed, "f");
    }
    get executor() {
        return tslib_1.__classPrivateFieldGet(this, _Action_executor, "f");
    }
    set executor(executor) {
        tslib_1.__classPrivateFieldSet(this, _Action_executor, executor, "f");
        this.hasExecutor = common_1.isFunction(executor);
    }
    get id() {
        return tslib_1.__classPrivateFieldGet(this, _Action_id, "f");
    }
    get original() {
        return tslib_1.__classPrivateFieldGet(this, _Action_original, "f");
    }
    get trigger() {
        return tslib_1.__classPrivateFieldGet(this, _Action_trigger, "f");
    }
    get status() {
        return tslib_1.__classPrivateFieldGet(this, _Action_status, "f");
    }
    set status(status) {
        tslib_1.__classPrivateFieldSet(this, _Action_status, status, "f");
    }
    abort(reason) {
        if (common_1.isArray(reason))
            reason = reason.join(', ');
        this.clearTimeout();
        this.status = c.ABORTED;
        this.result = new AbortExecuteError_1.default(reason);
        tslib_1.__classPrivateFieldSet(this, _Action_aborted, true, "f");
    }
    clearTimeout() {
        tslib_1.__classPrivateFieldGet(this, _Action_timeout, "f") && clearTimeout(tslib_1.__classPrivateFieldGet(this, _Action_timeout, "f"));
        tslib_1.__classPrivateFieldSet(this, _Action_timeout, null, "f");
        tslib_1.__classPrivateFieldSet(this, _Action_remaining, Infinity, "f");
    }
    clearInterval() {
        tslib_1.__classPrivateFieldGet(this, _Action_interval, "f") && clearInterval(tslib_1.__classPrivateFieldGet(this, _Action_interval, "f"));
        tslib_1.__classPrivateFieldSet(this, _Action_interval, null, "f");
        tslib_1.__classPrivateFieldSet(this, _Action_remaining, Infinity, "f");
    }
    /**
     * Executes the callback that is registered to this action, optionally
     * passing in any additional arguments
     * @param { any } args - Arguments passed to the executor function
     */
    async execute(...args) {
        try {
            this.clearTimeout();
            this.clearInterval();
            tslib_1.__classPrivateFieldSet(this, _Action_remaining, this.timeout, "f");
            this.error = null;
            tslib_1.__classPrivateFieldSet(this, _Action_executed, false, "f");
            this.result = undefined;
            this.status = c.PENDING;
            tslib_1.__classPrivateFieldSet(this, _Action_interval, setInterval(() => (tslib_1.__classPrivateFieldSet(this, _Action_remaining, tslib_1.__classPrivateFieldGet(this, _Action_remaining, "f") - 1000, "f")), 1000), "f");
            tslib_1.__classPrivateFieldSet(this, _Action_timeout, setTimeout(() => {
                this.clearTimeout();
                this.status = c.TIMED_OUT;
            }, this.timeout || DEFAULT_TIMEOUT), "f");
            // TODO - Logic for return values as objects (new if/ condition in action chains)
            this.result = tslib_1.__classPrivateFieldGet(this, _Action_aborted, "f") ? undefined : await this.executor?.(...args);
            if (this.result !== undefined)
                this['receivedResult'] = true;
            if (!tslib_1.__classPrivateFieldGet(this, _Action_aborted, "f")) {
                this.status = c.RESOLVED;
                tslib_1.__classPrivateFieldSet(this, _Action_executed, true, "f");
            }
            return this.result;
        }
        catch (error) {
            this.error = error;
            this.status = c.ERROR;
            throw error;
        }
        finally {
            this.clearTimeout();
            this.clearInterval();
        }
    }
    // Returns an update-to-date JS representation of this instance
    // This is needed to log to the console the current state instead of logging
    // this instance directly where values will not be as expected
    snapshot() {
        const snapshot = {
            actionType: this.actionType,
            error: this.error,
            executed: this.executed,
            hasExecutor: this.hasExecutor,
            id: this.id,
            original: tslib_1.__classPrivateFieldGet(this, _Action_original, "f"),
            remaining: tslib_1.__classPrivateFieldGet(this, _Action_remaining, "f"),
            receivedResult: this.receivedResult,
            status: this.status,
            trigger: this.trigger,
            timeout: this.timeout,
        };
        if (this.status === c.RESOLVED)
            snapshot['result'] = this.result;
        else if (this.status === c.ERROR)
            snapshot['result'] = this.error;
        return snapshot;
    }
    toString() {
        return JSON.stringify(this.snapshot(), null, 2);
    }
}
exports.default = Action;
//# sourceMappingURL=Action.js.map