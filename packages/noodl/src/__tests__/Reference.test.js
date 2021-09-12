"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nc = require("noodl-common");
const path_1 = require("path");
const Reference_1 = require("../Reference");
const createReference = (ref) => new Reference_1.default(ref);
const getPageDoc = (name = 'ReferenceTest') => nc.loadFile(path_1.default.join(__dirname, `./fixtures/${name}.yml`), 'doc');
describe(nc.italic(`Reference`), () => {
    it(``, () => {
        const reference = createReference();
        console.log();
    });
});
//# sourceMappingURL=Reference.test.js.map