"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock = require("noodl-ui-test-utils");
const u = require("@jsmanifest/utils");
const yaml_1 = require("yaml");
const chai_1 = require("chai");
const yaml_2 = require("yaml");
const noodl_common_1 = require("noodl-common");
const Identify_1 = require("../utils/Identify");
const createMap = (obj) => new yaml_1.default.Document(obj).contents;
describe(noodl_common_1.coolGold('Identify'), () => {
    describe.only(noodl_common_1.italic(`actions`), () => {
        const tests = {
            builtIn: mock.getBuiltInAction(),
            evalObject: mock.getEvalObjectAction(),
            pageJump: mock.getPageJumpAction(),
            popUp: mock.getPopUpAction(),
            popUpDismiss: mock.getPopUpDismissAction(),
            refresh: mock.getRefreshAction(),
            saveObject: mock.getSaveObjectAction(),
            updateObject: mock.getUpdateObjectAction(),
        };
        u.entries(tests).forEach(([actionType, actionObject]) => {
            it(`should return true for ${actionType} maps`, () => {
                const node = createMap(actionObject);
                chai_1.expect(Identify_1.default.action[actionType](node)).to.be.true;
            });
        });
    });
    xdescribe(noodl_common_1.italic('references'), () => {
        describe('dot (.)', () => {
            describe('..formData.password', () => {
                const node = new yaml_2.Scalar('..formData.password');
                it(`should be considered a local reference`, () => {
                    chai_1.expect(Identify_1.default.localReference(node)).to.be.true;
                });
                it(`should not be considered a root reference`, () => {
                    chai_1.expect(Identify_1.default.rootReference(node)).to.be.false;
                });
            });
            describe('.formData.password', () => {
                const node = new yaml_2.Scalar('.formData.password');
                it(`should be considered as a local reference`, () => {
                    chai_1.expect(Identify_1.default.localReference(node)).to.be.true;
                });
                it(`should not be considered as a root reference`, () => {
                    chai_1.expect(Identify_1.default.rootReference(node)).to.be.false;
                });
            });
            describe('.Formdata.password', () => {
                const node = new yaml_2.Scalar('.Formdata.password');
                it(`should not be considered as a root reference`, () => {
                    chai_1.expect(Identify_1.default.localReference(node)).to.be.false;
                });
                it(`should be considered as a root reference`, () => {
                    chai_1.expect(Identify_1.default.rootReference(node)).to.be.true;
                });
            });
            describe('..Formdata.password', () => {
                const node = new yaml_2.Scalar('..FormData.password');
                it(`should not be considered as a local reference`, () => {
                    chai_1.expect(Identify_1.default.localReference(node)).to.be.false;
                });
                it(`should be considered as a root reference`, () => {
                    chai_1.expect(Identify_1.default.rootReference(node)).to.be.true;
                });
            });
        });
        describe(`underline reverse traversal (___)`, () => {
            const valid = [
                '.builtIn.__hello',
                '.builtIn.=._______hello',
                'builtIn.__h',
                'builtIn.__.__h',
            ];
            const invalid = [
                '.builtIn.__.hello',
                '.builtIn.h__.hello',
                '.builtIn.h__hello',
                '.builtIn.=__hello',
                '.builtIn.=.hello',
                '.builtInhello',
                'builtIn.__.',
                'builtIn.__.__1',
                'builtIn___.',
            ];
            valid.forEach((str) => {
                it(`should consider "${str}" as a traverse reference`, () => {
                    const node = new yaml_2.Scalar(str);
                    chai_1.expect(Identify_1.default.traverseReference(node)).to.be.true;
                });
            });
            invalid.forEach((str) => {
                it(`should not consider "${str}" as a traverse reference`, () => {
                    const node = new yaml_2.Scalar(str);
                    chai_1.expect(Identify_1.default.traverseReference(node)).to.be.false;
                });
            });
        });
        describe(`equal (=)`, () => {
            const valid = ['=.builtIn.=global', '    =.dasds'];
            const invalid = [
                '.=',
                '=/',
                ' =',
                '@=',
                '@email',
                'hello',
                '.    =sa',
                '=',
                '=.',
            ];
            valid.forEach((s) => {
                it(`should consider "${s}" as an eval reference`, () => {
                    const node = new yaml_2.Scalar(s);
                    chai_1.expect(Identify_1.default.evalReference(node)).to.be.true;
                });
            });
            invalid.forEach((s) => {
                it(`should not consider "${s}" as an eval reference`, () => {
                    const node = new yaml_2.Scalar(s);
                    chai_1.expect(Identify_1.default.evalReference(node)).to.be.false;
                });
            });
        });
        describe(`at (@)`, () => {
            const valid = [
                '..appLink.url@',
                '.Global.currentUser.vertex.sk@',
                '.Global._nonce@',
                '..formData.checkMessage@',
            ];
            const invalid = ['..@.', '@', 'hello@_'];
            valid.forEach((s) => {
                it(`should consider "${s}" as a apply reference`, () => {
                    const node = new yaml_2.Scalar(s);
                    chai_1.expect(Identify_1.default.applyReference(node)).to.be.true;
                });
            });
            invalid.forEach((s) => {
                it(`should not consider "${s}" as a apply reference`, () => {
                    const node = new yaml_2.Scalar(s);
                    chai_1.expect(Identify_1.default.applyReference(node)).to.be.false;
                });
            });
        });
    });
});
//# sourceMappingURL=Identify.test.js.map