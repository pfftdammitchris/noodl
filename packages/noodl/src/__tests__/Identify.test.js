import * as mock from 'noodl-ui-test-utils';
import * as u from '@jsmanifest/utils';
import yaml from 'yaml';
import { expect } from 'chai';
import { Scalar } from 'yaml';
import { coolGold, italic } from 'noodl-common';
import Identify from '../utils/Identify';
const createMap = (obj) => new yaml.Document(obj).contents;
describe(coolGold('Identify'), () => {
    describe.only(italic(`actions`), () => {
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
                expect(Identify.action[actionType](node)).to.be.true;
            });
        });
    });
    xdescribe(italic('references'), () => {
        describe('dot (.)', () => {
            describe('..formData.password', () => {
                const node = new Scalar('..formData.password');
                it(`should be considered a local reference`, () => {
                    expect(Identify.localReference(node)).to.be.true;
                });
                it(`should not be considered a root reference`, () => {
                    expect(Identify.rootReference(node)).to.be.false;
                });
            });
            describe('.formData.password', () => {
                const node = new Scalar('.formData.password');
                it(`should be considered as a local reference`, () => {
                    expect(Identify.localReference(node)).to.be.true;
                });
                it(`should not be considered as a root reference`, () => {
                    expect(Identify.rootReference(node)).to.be.false;
                });
            });
            describe('.Formdata.password', () => {
                const node = new Scalar('.Formdata.password');
                it(`should not be considered as a root reference`, () => {
                    expect(Identify.localReference(node)).to.be.false;
                });
                it(`should be considered as a root reference`, () => {
                    expect(Identify.rootReference(node)).to.be.true;
                });
            });
            describe('..Formdata.password', () => {
                const node = new Scalar('..FormData.password');
                it(`should not be considered as a local reference`, () => {
                    expect(Identify.localReference(node)).to.be.false;
                });
                it(`should be considered as a root reference`, () => {
                    expect(Identify.rootReference(node)).to.be.true;
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
                    const node = new Scalar(str);
                    expect(Identify.traverseReference(node)).to.be.true;
                });
            });
            invalid.forEach((str) => {
                it(`should not consider "${str}" as a traverse reference`, () => {
                    const node = new Scalar(str);
                    expect(Identify.traverseReference(node)).to.be.false;
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
                    const node = new Scalar(s);
                    expect(Identify.evalReference(node)).to.be.true;
                });
            });
            invalid.forEach((s) => {
                it(`should not consider "${s}" as an eval reference`, () => {
                    const node = new Scalar(s);
                    expect(Identify.evalReference(node)).to.be.false;
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
                    const node = new Scalar(s);
                    expect(Identify.applyReference(node)).to.be.true;
                });
            });
            invalid.forEach((s) => {
                it(`should not consider "${s}" as a apply reference`, () => {
                    const node = new Scalar(s);
                    expect(Identify.applyReference(node)).to.be.false;
                });
            });
        });
    });
});
//# sourceMappingURL=Identify.test.js.map