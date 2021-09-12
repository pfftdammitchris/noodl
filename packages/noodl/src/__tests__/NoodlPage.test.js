"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noodl_common_1 = require("noodl-common");
const internal_1 = require("../utils/internal");
const test_utils_1 = require("../utils/test-utils");
describe(noodl_common_1.coolGold('NoodlPage'), () => {
    it(`deeply nested nodes should be able to find out their page name ` +
        `they are associated with`, () => {
        const EditProfile = test_utils_1.noodl.root.get('EditProfile');
        console.info(EditProfile);
        test_utils_1.visitor.visit(EditProfile, (args, util) => {
            if (internal_1.isScalar(args.node)) {
                if (args.node.value === 'Contact Information') {
                    // const nodeAtPath = getPageWithPath(args.path)
                    // expect(nodeAtPath).to.be.instanceOf(NoodlPage)
                    // expect(nodeAtPath).to.have.property('name', 'EditProfile')
                }
            }
        });
    });
});
//# sourceMappingURL=NoodlPage.test.js.map