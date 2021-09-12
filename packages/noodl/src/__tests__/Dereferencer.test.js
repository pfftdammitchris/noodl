"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const yaml_1 = require("yaml");
const chai_1 = require("chai");
const noodl_common_1 = require("noodl-common");
const yaml_2 = require("yaml");
const test_utils_1 = require("../utils/test-utils");
describe(noodl_common_1.coolGold('Dereferencer'), () => {
    describe(`getLocalReference`, () => {
        it(`should dereference to the expected value`, () => {
            const ref = '..title';
            const page = test_utils_1.noodl.root.get('EditProfile');
            const node = page.find((node) => node?.value === ref);
            const result = test_utils_1.dereferencer.getLocalReference(node, { page });
            chai_1.expect(result).to.eq('title123');
        });
    });
    describe(`getRootReference`, () => {
        it(`should dereference values from root`, () => {
            const lastName = 'gonzalez';
            const Global = test_utils_1.noodl.root.Global;
            const ref = '.Global.currentUser.vertex.name.lastName';
            Global.setIn('currentUser.vertex.name.lastName'.split('.'), lastName);
            const page = test_utils_1.noodl.root.get('EditProfile');
            const node = page.find((node) => node?.value === ref);
            const result = test_utils_1.dereferencer.getRootReference(node);
            chai_1.expect(result).to.eq(lastName);
        });
    });
    // describe(`Eval`, () => {
    // 	it.only(`should deference and evaluate`, () => {
    // 		const firstName = 'Adam'
    // 		const Global = dereferencer.root.Global
    // 		Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
    // 		const ref = '=..profileObject.name.data.firstName'
    // 		const page = dereferencer.createPage({
    // 			name: 'ABC',
    // 			doc: new yaml.Document({ hello: 'hehe' }),
    // 		})
    // 		const refNode = page.doc.createNode(ref, { wrapScalars: true })
    // 		page.doc.add(refNode)
    // 		const
    // 		// const ref = '=.Global.currentUser.vertex.name.firstName'
    // 		// const page = dereferencer.root.get('BaseDataModel') as NoodlPage
    // 		console.log('refNode', refNode)
    // 		transformer.transform(refNode)
    // 		expect(refNode).to.have.property('value', firstName)
    // 	})
    // })
    xdescribe(`Apply`, () => {
        let Global;
        let userVertex;
        let nameField;
        beforeEach(() => {
            Global = test_utils_1.dereferencer.root.get('Global');
            userVertex = test_utils_1.dereferencer.root.userVertex;
            nameField = test_utils_1.dereferencer.root.userVertex.get('name');
        });
        it(`should apply the value to the path referenced in the key`, () => {
            const firstName = 'Bobby';
            const str = '.Global.currentUser.vertex.name.firstName@';
            const Global = test_utils_1.dereferencer.root.Global;
            Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName);
            const page = test_utils_1.dereferencer.pages.get('EditProfile');
            // prettier-ignore
            const pair = page.find((n) => u.isPair(n) && n.key.value === str);
            const applyRef = pair.key;
            const evalRef = pair.value;
            transformer.transform(pair);
            console.log('applyRef', applyRef);
            console.log('evalRef', evalRef);
            const key = '';
        });
    });
    describe(`Deeply nested dereferencing`, () => {
        it(`should be able to dereference through deeply nested references`, () => {
            const firstName = 'Michael';
            const Global = test_utils_1.noodl.root.Global;
            Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName);
            const EditProfile = test_utils_1.noodl.pages.get('EditProfile');
            EditProfile.doc.add(EditProfile.doc.createPair('hehe', '.ABC.whatIsTheFirstName'));
            const doc = new yaml_1.default.Document({ hello: 'hehe' });
            const pair = doc.createPair('whatIsTheFirstName', '.DisplayProfile.profileObject.name.data.firstName');
            test_utils_1.noodl.createPage({ name: 'ABC', doc });
            doc.add(pair);
            const refNode = new yaml_2.Scalar('.EditProfile.hehe');
            chai_1.expect(test_utils_1.dereferencer.getReference(refNode.value)).to.eq(firstName);
        });
    });
});
//# sourceMappingURL=Dereferencer.test.js.map