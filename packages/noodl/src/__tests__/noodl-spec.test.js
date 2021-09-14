import { coolGold, italic } from 'noodl-common';
import { noodl } from '../utils/test-utils';
import Transformer, { _noodlSpecTransformers } from '../Transformer';
let transformer;
beforeEach(() => {
    transformer = new Transformer({ pages: noodl.pages, root: noodl.root });
    Object.values(_noodlSpecTransformers).forEach(transformer.createTransform.bind(transformer));
});
describe(coolGold('NOODL Specification'), () => {
    describe(italic('References'), () => {
        //
    });
});
//# sourceMappingURL=noodl-spec.test.js.map