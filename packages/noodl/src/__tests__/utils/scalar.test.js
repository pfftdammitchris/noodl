import { expect } from 'chai';
import { coolGold, italic } from 'noodl-common';
import { Scalar } from 'yaml';
import * as util from '../../utils/scalar';
describe(coolGold('Scalar utils'), () => {
    describe(italic('getPreparedKeyForDereference'), () => {
        const combos = [
            ['..save', 'save'],
            ['.builtIn.Hello,.abac1!@#f  a', 'builtIn.Hello,.abac1!@#f  a'],
            ['   ..hello.123', 'hello.123'],
        ];
        combos.forEach(([value, expectedResult]) => {
            it(`should return ${expectedResult || 'an empty string'} instead of ${value}`, () => {
                expect(util.getPreparedKeyForDereference(new Scalar(value))).to.eq(expectedResult);
            });
        });
    });
});
//# sourceMappingURL=scalar.test.js.map