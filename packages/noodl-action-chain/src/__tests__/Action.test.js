"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const chai_1 = require("chai");
const Action_1 = require("../Action");
describe('Action', () => {
    describe('Executing', () => {
        it('should reset the result/error state to their default values', () => {
            const pageJump = { actionType: 'pageJump', destination: 'SignIn' };
            const action = new Action_1.default('onClick', pageJump);
            const err = new Error('fsdfd');
            action.error = err;
            action.result = 'abc';
            chai_1.expect(action.error).to.equal(err);
            action.error = null;
            chai_1.expect(action.error).to.be.null;
            chai_1.expect(action.result).to.equal('abc');
            action.execute();
            chai_1.expect(action.error).to.be.instanceOf(Error);
            chai_1.expect(action.error).not.to.eq(err);
            chai_1.expect(action.result).to.be.undefined;
        });
        it(`should set status to ${chalk_1.default.magenta('resolved')} if the execution was successful`, async () => {
            const pageJump = { actionType: 'pageJump', destination: 'SignIn' };
            const action = new Action_1.default('onClick', pageJump);
            action.executor = async () => 'abc';
            chai_1.expect(action.execute()).to.eventually.eq('resolved');
        });
    });
    describe('When failing', () => {
        it('should set the error property to the error if the execution failed', async () => {
            const pageJump = { actionType: 'pageJump', destination: 'SignIn' };
            const action = new Action_1.default('onClick', pageJump);
            action.executor = async () => {
                throw new Error('abc');
            };
            try {
                await action.execute();
            }
            catch (error) {
                chai_1.expect(action.status).to.eq('error');
                chai_1.expect(action.error).to.eq(error);
            }
        });
    });
    it('should set status to resolved if the execution was a success (async)', async () => {
        const pageJump = { actionType: 'pageJump', destination: 'SignIn' };
        const action = new Action_1.default('onClick', pageJump);
        action.executor = async () => 'abc';
        await action.execute({ abc: 'letters' });
        chai_1.expect(action.status).to.eq('resolved');
    });
});
//# sourceMappingURL=Action.test.js.map