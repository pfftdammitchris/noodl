"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noodl_common_1 = require("noodl-common");
const test_utils_1 = require("../utils/test-utils");
const Transformer_1 = require("../Transformer");
let transformer;
beforeEach(() => {
    transformer = new Transformer_1.default({ pages: test_utils_1.noodl.pages, root: test_utils_1.noodl.root });
    Object.values(Transformer_1._noodlSpecTransformers).forEach(transformer.createTransform.bind(transformer));
});
describe(noodl_common_1.coolGold('NOODL Specification'), () => {
    describe(noodl_common_1.italic('References'), () => {
        //
    });
});
//# sourceMappingURL=noodl-spec.test.js.map