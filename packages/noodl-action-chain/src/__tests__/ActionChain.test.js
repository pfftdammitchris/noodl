"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.magenta = exports.italic = exports.coolGold = void 0;
const chai_1 = require("chai");
const chalk_1 = require("chalk");
const sinon_1 = require("sinon");
const Action_1 = require("../Action");
const ActionChain_1 = require("../ActionChain");
const AbortExecuteError_1 = require("../AbortExecuteError");
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
const createAction_1 = require("../utils/createAction");
const coolGold = (...s) => chalk_1.default.keyword('navajowhite')(...s);
exports.coolGold = coolGold;
const italic = (...s) => chalk_1.default.italic(chalk_1.default.white(...s));
exports.italic = italic;
const magenta = (...s) => chalk_1.default.magenta(...s);
exports.magenta = magenta;
describe(exports.coolGold(`ActionChain`), () => {
    describe(exports.italic(`Generator`), () => {
        it(`should return an ${'AsyncGenerator'}`, () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getEvalObjectAction()],
                trigger: 'onChange',
            });
            const gen = ActionChain_1.default.createGenerator(ac);
            chai_1.expect(Symbol.asyncIterator in gen).to.be.true;
        });
        describe(`Calling ${'next'}`, () => {
            it(`should always return the iterator result in the shape { value, done }`, async () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getPopUpDismissAction()],
                    trigger: 'onChange',
                });
                ac.loadQueue();
                let result = await ac.next();
                chai_1.expect(result).to.have.property('done');
                chai_1.expect(result).to.have.property('value');
                result = await ac.next();
                chai_1.expect(result).to.have.property('done');
                chai_1.expect(result).to.have.property('value');
            });
            it(`should always attach an action instance as the "value" property on the iterator result`, async () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getPopUpDismissAction(), helpers_1.getBuiltInAction()],
                    trigger: 'onChange',
                });
                ac.loadQueue();
                let result = await ac.next();
                chai_1.expect(result).to.have.property('value').to.be.instanceOf(Action_1.default);
                result = await ac.next();
                chai_1.expect(result).to.have.property('value').to.be.instanceOf(Action_1.default);
            });
            it(`should never return the same action in subsequent iterations`, async () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getPopUpDismissAction(), helpers_1.getBuiltInAction()],
                    trigger: 'onHover',
                });
                ac.loadQueue();
                let iteratorResult = await ac.next();
                const firstAction = iteratorResult.value;
                iteratorResult = await ac.next();
                const secondAction = iteratorResult.value;
                chai_1.expect(firstAction).not.to.eq(secondAction);
                iteratorResult = await ac.next();
                const thirdAction = iteratorResult.value;
                chai_1.expect(firstAction).not.to.eq(thirdAction);
                chai_1.expect(secondAction).not.to.eq(thirdAction);
            });
            it(`should pass the result of the previous action's callback as args`, async () => {
                const spy1 = sinon_1.default.spy(() => 'hello');
                const ac = helpers_1.getActionChain({
                    actions: [{ action: helpers_1.getPopUpDismissAction(), fn: spy1 }],
                    trigger: 'onChange',
                });
                const nextSpy = sinon_1.default.spy(ac, 'next');
                await ac.execute();
                chai_1.expect(nextSpy.secondCall.args[0]).to.eq('hello');
                nextSpy.restore();
            });
            describe(`when it is the last item in the generator`, () => {
                it(`should return an array of results of objects in the shape of { action, result }`, async () => {
                    const ac = helpers_1.getActionChain({
                        actions: [helpers_1.getPopUpDismissAction(), helpers_1.getPopUpAction()],
                        trigger: 'onChange',
                    });
                    const results = await ac.execute();
                    chai_1.expect(results).to.be.an('array').with.lengthOf(2);
                    results.forEach((res) => {
                        chai_1.expect(res).to.have.property('action').to.be.instanceOf(Action_1.default);
                        chai_1.expect(res).to.have.property('result');
                    });
                });
            });
        });
    });
    describe(exports.italic(`Loading`), () => {
        it('should loadQueue up the instances', () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                trigger: 'onMouseOver',
            });
            ac.queue.forEach((a) => chai_1.expect(a).to.be.instanceOf(Action_1.default));
        });
    });
    describe(exports.italic(`Execution`), () => {
        it(`should only invoke the callback once`, async () => {
            const spy = sinon_1.default.spy();
            const ac = helpers_1.getActionChain({
                actions: [{ action: helpers_1.getEvalObjectAction(), fn: async () => spy() }],
                trigger: 'onChange',
            });
            await ac.execute();
            chai_1.expect(spy).to.be.calledOnce;
        });
        it('should call the "execute" method on every action', async () => {
            const spy1 = sinon_1.default.spy();
            const spy2 = sinon_1.default.spy();
            const ac = helpers_1.getActionChain({
                actions: [
                    { action: helpers_1.getBuiltInAction(), fn: spy1 },
                    { action: helpers_1.getEvalObjectAction(), fn: spy2 },
                ],
                trigger: 'onChange',
            });
            await ac.execute();
            chai_1.expect(spy1).to.be.calledOnce;
            chai_1.expect(spy2).to.be.calledOnce;
        });
        it(`should set the current action instance as the value of the "current" property`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                trigger: 'onChange',
            });
            chai_1.expect(ac.current).to.be.null;
            let result = await ac.next();
            chai_1.expect(ac.current).to.be.instanceOf(Action_1.default);
            chai_1.expect(ac.current).to.have.property('actionType', 'builtIn');
            chai_1.expect(ac.current).to.eq(result.value);
            result = await ac.next();
            chai_1.expect(ac.current).to.be.instanceOf(Action_1.default);
            chai_1.expect(ac.current).to.have.property('actionType', 'evalObject');
            chai_1.expect(ac.current).to.eq(result.value);
        });
        describe(`Injecting`, () => {
            it(`should return the action instance`, () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getBuiltInAction()],
                    trigger: 'onChange',
                });
                const action = ac.inject(new Action_1.default(ac.trigger, helpers_1.getPopUpAction()));
                chai_1.expect(action).to.be.instanceOf(Action_1.default);
            });
            it(`should add the new action in the beginning of the queue`, () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getBuiltInAction(), helpers_1.getPopUpAction()],
                    trigger: 'onChange',
                });
                chai_1.expect(ac.queue).to.have.lengthOf(2);
                chai_1.expect(ac.queue[0]).to.have.property('actionType', 'builtIn');
                ac.inject(new Action_1.default(ac.trigger, helpers_1.getPopUpAction()));
                chai_1.expect(ac.queue).to.have.lengthOf(3);
                chai_1.expect(ac.queue[0]).to.have.property('actionType', 'popUp');
            });
            it(`should add the new action inside its "injected" object in the snapshot`, () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                    trigger: 'onChange',
                });
                const injectee = helpers_1.getPopUpAction();
                ac.inject(injectee);
                chai_1.expect(ac.snapshot().injected[0])
                    .to.have.property('original')
                    .eq(injectee);
            });
            describe(`When the action injecting is a popUp using "${chalk_1.default.magenta('wait')}"`, () => {
                it(`should set its status to "aborting"`, () => {
                    const ac = helpers_1.getActionChain({
                        actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                        loader: (actions) => actions.map((action) => createAction_1.default(action)),
                    });
                    // expect(ac.).to.have.property('status', 'aborting')
                });
                xit(`should still execute the injectee`, () => {
                    helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction();
                    const ac = helpers_1.getActionChain({
                        actions: [helpers_1.getUpdateObjectAction(), helpers_1.getSaveObjectAction()],
                        trigger: 'onChange',
                    });
                    const injectee = helpers_1.getPopUpAction();
                });
                xit(`should call abort on the remaining actions in the queue`, () => {
                    //
                });
                xit(`should not be calling executors when aborting`, () => {
                    //
                });
                xit(`should set its status to "aborted" after its done`, () => {
                    //
                });
            });
        });
    });
    describe(exports.italic(`Aborting`), () => {
        it(`should return true if status is "aborted"`, () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                trigger: 'onMouseLeave',
            });
            chai_1.expect(ac.snapshot().status).to.eq(constants_1.IDLE);
            ac.abort();
            chai_1.expect(ac.snapshot().status).to.eq(constants_1.ABORTED);
            chai_1.expect(ac.isAborted()).to.be.true;
        });
        it(`should not throw an error`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getEvalObjectAction()],
                trigger: 'placeholder',
            });
            await chai_1.expect(ac.abort()).not.to.eventually.be.rejected;
        });
        it(`should append the AbortExecuteError error object to each aborted result in the array`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getEvalObjectAction(), helpers_1.getBuiltInAction()],
                trigger: 'onChange',
            });
            await ac.abort();
            const results = ac.snapshot().results;
            chai_1.expect(results).to.have.lengthOf(2);
            ac.queue.forEach((_, index) => {
                chai_1.expect(results[index].result).to.be.instanceOf(AbortExecuteError_1.default);
            });
        });
    });
    describe(exports.italic(`Observers`), () => {
        describe(exports.magenta(`onAbortStart`), () => {
            it(`should call ${exports.magenta(`onAbortStart`)} when aborting`, async () => {
                const spy = sinon_1.default.spy();
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getEvalObjectAction(), helpers_1.getBuiltInAction()],
                    trigger: 'onChange',
                    use: { onAbortStart: spy },
                });
                await ac.abort();
                chai_1.expect(spy).to.be.calledOnce;
            });
        });
        describe(exports.magenta(`onAbortEnd`), () => {
            it(`should call ${exports.magenta(`onAbortEnd`)} in the end of aborting`, async () => {
                const spy = sinon_1.default.spy();
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getEvalObjectAction(), helpers_1.getBuiltInAction()],
                    trigger: 'onChange',
                    use: { onAbortStart: spy },
                });
                await ac.abort();
                ac.snapshot().results.forEach((r) => {
                    chai_1.expect(r.result).to.be.instanceOf(AbortExecuteError_1.default);
                    chai_1.expect(r.action.executed).to.be.false;
                    chai_1.expect(r.action.aborted).to.be.true;
                });
            });
        });
        describe(exports.magenta(`onAbortError`), () => {
            xit(`should be called when an error occurred during the abort`, () => {
                //
            });
        });
        describe(exports.magenta(`onBeforeAbortAction`), () => {
            xit(`should be called right before calling the action's abort method`, () => {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                    trigger: 'onMouseLeave',
                });
                // @ts-expect-error
                ac.loader = (actions) => {
                    return actions.map((a) => createAction_1.default({ action: a, trigger: 'onClick' }));
                };
                ac.loadQueue();
            });
        });
        describe(exports.magenta(`onAfterAbortAction`), () => {
            xit(`should be called right after calling the action's abort method`, () => {
                //
            });
        });
        describe(exports.magenta(`onExecuteStart`), () => {
            xit(`should called`, () => {
                //
            });
        });
        describe(exports.magenta(`onExecuteEnd`), () => {
            //
        });
        describe(exports.magenta(`onExecuteResult`), () => {
            //
        });
        describe(exports.magenta(`onRefresh`), () => {
            //
        });
        describe(exports.magenta(`onBeforeInject`), () => {
            //
        });
        describe(exports.magenta(`onAfterInject`), () => {
            //
        });
    });
    describe(exports.italic(`Return values`), () => {
        // it(`should reach the result as { action, result } in the first`, () => {
        // 	//
        // })
        it(`should receive an array of { action, result } when aborting`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                trigger: 'onChange',
            });
            await ac.next({});
            const results = await ac.abort('idk');
            chai_1.expect(results).to.be.an('array');
            chai_1.expect(results).to.have.lengthOf(ac.actions.length);
        });
        xit(`should receive an array of { action, result } when execution is finished`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getBuiltInAction(), helpers_1.getEvalObjectAction()],
                trigger: 'onChange',
            });
            const results = await ac.execute();
            results.forEach((res) => {
                // expect(res).to.have.property('action').to.be.instanceOf(Action)
                // expect(res).to.have.property('result')
            });
        });
    });
    describe(exports.italic(`snapshot`), () => {
        it(`should convert the data to an array`, async () => {
            const ac = helpers_1.getActionChain({
                actions: [helpers_1.getEvalObjectAction()],
                trigger: 'onChange',
            });
            const buff = new ArrayBuffer(3);
            ac.data.set('abc', buff);
            const snapshot = ac.snapshot();
            chai_1.expect(snapshot.data).to.be.an('array');
            chai_1.expect(snapshot.data).to.have.lengthOf(1);
            chai_1.expect(snapshot.data[0]).to.eq(buff);
        });
    });
    xdescribe(exports.italic(`Timing out`), () => {
        describe.skip(`when action chains don't respond or don't finish`, () => {
            xit(`should call the timeout setTimeout callback`, async function () {
                const ac = helpers_1.getActionChain({
                    actions: [helpers_1.getEvalObjectAction(), helpers_1.getPopUpAction()],
                    trigger: 'onBlur',
                });
                await ac.execute();
                // expect(ac.state.status).to.eq('aborted')
            });
            xit(`should save the ref on the instance`, () => {
                //
            });
            xit(`should execute after the provided milliseconds`, () => {
                //
            });
            xit(`should call "abort" on all remainining actions in the queue`, () => {
                //
            });
            xit(`should call its own "abort" method after aborting the remaining actions`, () => {
                //
            });
            xit(`should throw with the ${'AbortExecuteError'} error`, () => {
                //
            });
            xit(`should set the status to "aborted" and set the reason as timed out`, () => {
                //
            });
        });
    });
});
//# sourceMappingURL=ActionChain.test.js.map