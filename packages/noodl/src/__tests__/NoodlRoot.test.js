"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const nc = require("noodl-common");
const test_utils_1 = require("../utils/test-utils");
describe(nc.coolGold('NoodlRoot'), () => {
    it(``, () => {
        //
    });
    // describe(italic('Global'), () => {
    // 	describe(`When using the user vertex api`, () => {
    // 		describe(`setglobalPathToUserVertex`, () => {
    // 			xit(`should set the path to the user object`, () => {
    // 				//
    // 			})
    // 		})
    // 	})
    // })
    describe('when iterating using the "for of" loop', () => {
        it(`should pass the value in each loop as the top level property of the root cache`, () => {
            for (const [name, node] of test_utils_1.noodl.root) {
                chai_1.expect(node).to.eq(test_utils_1.noodl.root.get(name));
            }
        });
    });
});
//# sourceMappingURL=NoodlRoot.test.js.map