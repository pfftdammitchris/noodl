"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const yaml_1 = require("yaml");
const chai_1 = require("chai");
const path_1 = require("path");
const com = require("noodl-common");
const test_utils_1 = require("../../utils/test-utils");
before(() => {
    com
        .loadFilesAsDocs({
        as: 'metadataDocs',
        dir: path_1.default.resolve(path_1.default.join(process.cwd(), 'dev/noodl-morph/__tests__/fixtures')),
        recursive: false,
    })
        .forEach((obj) => {
        const name = obj.name.substring(0, obj.name.indexOf('.'));
        test_utils_1.noodl.createPage({
            name,
            doc: obj.doc,
            spread: /(BaseCSS|BaseDataModel)/.test(name),
        });
    });
});
describe(com.coolGold('visitor utils'), () => {
    describe(com.italic('getValueFromRoot'), () => {
        it(`should get values from root`, () => {
            const v = test_utils_1.visitor.utils();
            const style = v.getValueFromRoot('Style');
            chai_1.expect(style).to.be.instanceOf(yaml_1.YAMLMap);
            const textAlign = v.getValueFromRoot('Style.textAlign');
            const textAlignJs = textAlign.toJSON();
            chai_1.expect(textAlignJs).to.have.property('x', 'center');
            chai_1.expect(textAlignJs).to.have.property('y', 'center');
            chai_1.expect(textAlign.items).to.have.lengthOf(2);
            chai_1.expect(v.getValueFromRoot('Style.textAlign.y')).to.have.property('value', 'center');
            chai_1.expect(v.getValueFromRoot('Style.textAlign.x')).to.have.property('value', 'center');
        });
        xit(`should get the node from root`, () => {
            //
        });
    });
});
//# sourceMappingURL=visitor.test.js.map