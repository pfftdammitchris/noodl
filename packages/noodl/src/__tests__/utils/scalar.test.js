"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const noodl_common_1 = require("noodl-common");
const yaml_1 = require("yaml");
const util = require("../../utils/scalar");
describe(noodl_common_1.coolGold('Scalar utils'), () => {
    describe(noodl_common_1.italic('getPreparedKeyForDereference'), () => {
        const combos = [
            ['..save', 'save'],
            ['.builtIn.Hello,.abac1!@#f  a', 'builtIn.Hello,.abac1!@#f  a'],
            ['   ..hello.123', 'hello.123'],
        ];
        combos.forEach(([value, expectedResult]) => {
            it(`should return ${expectedResult || 'an empty string'} instead of ${value}`, () => {
                chai_1.expect(util.getPreparedKeyForDereference(new yaml_1.Scalar(value))).to.eq(expectedResult);
            });
        });
    });
});
//# sourceMappingURL=scalar.test.js.map