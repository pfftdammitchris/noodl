import * as nc from 'noodl-common';
import path from 'path';
import Reference from '../Reference';
const createReference = (ref) => new Reference(ref);
const getPageDoc = (name = 'ReferenceTest') => nc.loadFile(path.join(__dirname, `./fixtures/${name}.yml`), 'doc');
describe(nc.italic(`Reference`), () => {
    it(``, () => {
        const reference = createReference();
        console.log();
    });
});
//# sourceMappingURL=Reference.test.js.map