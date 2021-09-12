"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const chai_1 = require("chai");
const path_1 = require("path");
const yaml_1 = require("yaml");
const fs_extra_1 = require("fs-extra");
const nc = require("..");
const pathNameToFixtures = './src/__tests__/fixtures';
const pathnameToAboutAitmedPage = `${pathNameToFixtures}/AboutAitmed.yml`;
const filenames = fs_extra_1.default.readdirSync(pathNameToFixtures, 'utf8');
describe(nc.coolGold(`noodl-common`), () => {
    describe(nc.italic(`getFileStructure`), () => {
        const docExts = ['json', 'pdf', 'doc', 'docx'];
        docExts.forEach((docExt) => {
            const documentStructPath = `/Users/christ/noodl-cli/SignIn.${docExt}`;
            it(`should return the expected document file structure for "${documentStructPath}"`, () => {
                const fileStructure = nc.getFileStructure(documentStructPath);
                chai_1.expect(fileStructure).to.have.property('dir', `/Users/christ/noodl-cli`);
                chai_1.expect(fileStructure).to.have.property('ext', `.${docExt}`);
                chai_1.expect(fileStructure).to.have.property('filename', `SignIn`);
                chai_1.expect(fileStructure).to.have.property('filepath', documentStructPath);
                chai_1.expect(fileStructure).to.have.property('rootDir', `/`);
                chai_1.expect(fileStructure).to.have.property('group', 'document');
            });
        });
        const configStructPath = '/christ/noodl-cli/meet4d.yml';
        it(`should return the expected config file structure for "${configStructPath}"`, () => {
            const fileStructure = nc.getFileStructure(configStructPath, {
                config: 'meet4d',
            });
            chai_1.expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`);
            chai_1.expect(fileStructure).to.have.property('ext', `.yml`);
            chai_1.expect(fileStructure).to.have.property('filename', 'meet4d');
            chai_1.expect(fileStructure).to.have.property('filepath', configStructPath);
            chai_1.expect(fileStructure).to.have.property('rootDir', `/`);
            chai_1.expect(fileStructure).to.have.property('group', `config`);
        });
        const imageStructPath = '/christ/noodl-cli/pop.jpeg';
        it(`should return the expected image file structure for "${imageStructPath}"`, () => {
            const fileStructure = nc.getFileStructure(imageStructPath, {
                config: 'meet4d',
            });
            chai_1.expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`);
            chai_1.expect(fileStructure).to.have.property('ext', `.jpeg`);
            chai_1.expect(fileStructure).to.have.property('filename', 'pop');
            chai_1.expect(fileStructure).to.have.property('filepath', imageStructPath);
            chai_1.expect(fileStructure).to.have.property('rootDir', `/`);
            chai_1.expect(fileStructure).to.have.property('group', `image`);
        });
        const pageStructPath = '/christ/noodl-cli/CreateNewAccount.yml';
        it(`should return the expected page file structure for "${pageStructPath}"`, () => {
            const fileStructure = nc.getFileStructure(pageStructPath, {
                config: 'meet4d',
            });
            chai_1.expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`);
            chai_1.expect(fileStructure).to.have.property('ext', `.yml`);
            chai_1.expect(fileStructure).to.have.property('filename', 'CreateNewAccount');
            chai_1.expect(fileStructure).to.have.property('filepath', pageStructPath);
            chai_1.expect(fileStructure).to.have.property('rootDir', `/`);
            chai_1.expect(fileStructure).to.have.property('group', `page`);
        });
        const videoStructPath = '/christ/noodl-cli/hi.mp4';
        it(`should return the expected video file structure for "${imageStructPath}"`, () => {
            const fileStructure = nc.getFileStructure(videoStructPath);
            chai_1.expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`);
            chai_1.expect(fileStructure).to.have.property('ext', `.mp4`);
            chai_1.expect(fileStructure).to.have.property('filename', 'hi');
            chai_1.expect(fileStructure).to.have.property('filepath', videoStructPath);
            chai_1.expect(fileStructure).to.have.property('rootDir', `/`);
            chai_1.expect(fileStructure).to.have.property('group', `video`);
        });
    });
    describe(nc.italic(`getLinkStructure`), () => {
        const docExts = ['json', 'pdf', 'doc', 'docx'];
        docExts.forEach((docExt) => {
            const documentStructPath = `https://aitmed.io/config/index.${docExt}`;
            it(`should return the expected document file structure for "${documentStructPath}"`, () => {
                const linkStructure = nc.getLinkStructure(documentStructPath);
                chai_1.expect(linkStructure).to.have.property('ext', `.${docExt}`);
                chai_1.expect(linkStructure).to.have.property('filename', `index`);
                chai_1.expect(linkStructure).to.have.property('isRemote', true);
                chai_1.expect(linkStructure).to.have.property('group', 'document');
                chai_1.expect(linkStructure).to.have.property('url', documentStructPath);
            });
        });
        const configStructurePath = `https://aitmed.io/config/index/abc.yml`;
        it(`should return the expected config file structure for "${configStructurePath}"`, () => {
            const linkStructure = nc.getLinkStructure(configStructurePath, {
                config: 'abc',
            });
            chai_1.expect(linkStructure).to.have.property('ext', `.yml`);
            chai_1.expect(linkStructure).to.have.property('filename', `abc`);
            chai_1.expect(linkStructure).to.have.property('isRemote', true);
            chai_1.expect(linkStructure).to.have.property('group', 'config');
            chai_1.expect(linkStructure).to.have.property('url', configStructurePath);
        });
        const imageStructurePath = `https://aitmed.io/config/index/abc.png`;
        it(`should return the expected config file structure for "${imageStructurePath}"`, () => {
            const linkStructure = nc.getLinkStructure(imageStructurePath);
            chai_1.expect(linkStructure).to.have.property('ext', `.png`);
            chai_1.expect(linkStructure).to.have.property('filename', `abc`);
            chai_1.expect(linkStructure).to.have.property('isRemote', true);
            chai_1.expect(linkStructure).to.have.property('group', 'image');
            chai_1.expect(linkStructure).to.have.property('url', imageStructurePath);
        });
        const pageStructurePath = `https://aitmed.io/config/index/Abc.yml`;
        it(`should return the expected config file structure for "${pageStructurePath}"`, () => {
            const linkStructure = nc.getLinkStructure(pageStructurePath, {
                config: 'ab',
            });
            chai_1.expect(linkStructure).to.have.property('ext', `.yml`);
            chai_1.expect(linkStructure).to.have.property('filename', `Abc`);
            chai_1.expect(linkStructure).to.have.property('isRemote', true);
            chai_1.expect(linkStructure).to.have.property('group', 'page');
            chai_1.expect(linkStructure).to.have.property('url', pageStructurePath);
        });
        const videoStructurePath = `https://aitmed.io/config/index/loop.mp4`;
        it(`should return the expected config file structure for "${videoStructurePath}"`, () => {
            const linkStructure = nc.getLinkStructure(videoStructurePath, {
                config: 'ab',
            });
            chai_1.expect(linkStructure).to.have.property('ext', `.mp4`);
            chai_1.expect(linkStructure).to.have.property('filename', `loop`);
            chai_1.expect(linkStructure).to.have.property('isRemote', true);
            chai_1.expect(linkStructure).to.have.property('group', 'video');
            chai_1.expect(linkStructure).to.have.property('url', videoStructurePath);
        });
    });
    describe(nc.italic(`isImage`), () => {
        const tests = {
            'image/png': true,
            'image/jpg/': false,
            'image/jpeg': true,
            'f.png': true,
            '.png': true,
            '.png.': false,
            'image/png.': false,
            'image png': true,
        };
        u.eachEntries(tests, (value, expectedValue) => {
            it(`should return ${expectedValue} for "${value}"`, () => {
                chai_1.expect(nc.isImage(value)).to.be[expectedValue];
            });
        });
    });
    describe(nc.italic(`isVideo`), () => {
        const tests = {
            'video/mp4': true,
            'video/mkv/': false,
            'video/flv': true,
            'f.flv': true,
            '.flv': true,
            '.flv.': false,
            'video/avi.': false,
            'video avi': true,
        };
        u.eachEntries(tests, (value, expectedValue) => {
            it(`should return ${expectedValue} for "${value}"`, () => {
                chai_1.expect(nc.isVideo(value)).to.be[expectedValue];
            });
        });
    });
    describe(nc.italic(`loadFile`), () => {
        it(`should return the raw file data as string by default when given only the filepath`, () => {
            const data = nc.loadFile(pathnameToAboutAitmedPage);
            chai_1.expect(data).to.be.a.string;
        });
        it(`should return the file data as a yaml doc when passing 'doc' as 2nd arg`, () => {
            chai_1.expect(yaml_1.default.isDocument(nc.loadFile(pathnameToAboutAitmedPage, 'doc'))).to
                .be.true;
        });
        it(`should return the file data as a JSON object when passing 'json' as 2nd arg`, () => {
            const data = nc.loadFile(pathnameToAboutAitmedPage, 'json');
            chai_1.expect(u.isStr(data)).to.be.false;
            chai_1.expect(yaml_1.default.isDocument(data)).to.be.false;
            chai_1.expect(u.isObj(data)).to.be.true;
            chai_1.expect(data).to.have.property('AboutAitmed');
        });
    });
    describe(nc.italic(`loadFiles`), () => {
        describe(`when passing in filepath and 2nd arg type`, () => {
            it(`should return an array of yml data by default`, () => {
                const ymls = nc.loadFiles(pathNameToFixtures);
                chai_1.expect(ymls).to.have.lengthOf(filenames.length);
                ymls.forEach((yml) => chai_1.expect(yml).to.be.a.string);
            });
            it(`should return an array of docs when 2nd arg is "doc"`, () => {
                const ymls = nc.loadFiles(pathNameToFixtures, 'doc');
                chai_1.expect(ymls).to.have.lengthOf(filenames.length);
                ymls.forEach((yml) => chai_1.expect(yaml_1.default.isDocument(yml)).to.be.true);
            });
            it(`should return an array of objects when 2nd arg is "json"`, () => {
                const ymls = nc.loadFiles(pathNameToFixtures, 'json');
                chai_1.expect(ymls).to.be.an('array');
            });
            it(`should load them into an array if as is "list"`, () => {
                const result = nc.loadFiles(pathNameToFixtures, { as: 'list' });
                chai_1.expect(result).to.be.an('array').with.lengthOf(filenames.length);
                u.eachEntries(result, (filename, yml) => chai_1.expect(yml).to.be.a.string);
            });
            it(`should load them into a map if as is "map"`, () => {
                const result = nc.loadFiles(pathNameToFixtures, { as: 'map' });
                chai_1.expect(result).to.be.instanceOf(Map);
                chai_1.expect(result.size).to.eq(filenames.length);
            });
            it(`should load them into an object if as is "object"`, () => {
                const result = nc.loadFiles(pathNameToFixtures, { as: 'object' });
                const keys = u.keys(result);
                chai_1.expect(result).to.be.an('object');
                chai_1.expect(keys).to.have.lengthOf(filenames.length);
                u.eachEntries(result, (filename, yml) => chai_1.expect(yml).to.be.a.string);
            });
            it(`should not include the ext as their keys by default for object keys`, () => {
                const result = nc.loadFiles(pathNameToFixtures, { as: 'object' });
                filenames.forEach((filename) => chai_1.expect(result).to.have.property(path_1.default.basename(filename, '.yml')));
            });
            it(`should not include the ext by default for map keys`, () => {
                const result = nc.loadFiles(pathNameToFixtures, { as: 'map' });
                chai_1.expect(result.size).to.eq(filenames.length);
                filenames.forEach((filename) => chai_1.expect(result.has(path_1.default.basename(filename, '.yml'))).to.be.true);
            });
            it(`should include the ext in the keys if includeExt is true`, () => {
                const result = nc.loadFiles(pathNameToFixtures, {
                    as: 'object',
                    includeExt: true,
                });
                filenames.forEach((filename) => {
                    chai_1.expect(result).to.have.property(filename);
                    chai_1.expect(filename.endsWith('.yml')).to.be.true;
                });
            });
            it(`should include the ext in the keys if includeExt is true for map output`, () => {
                const result = nc.loadFiles(pathNameToFixtures, {
                    as: 'map',
                    includeExt: true,
                });
                filenames.forEach((filename) => {
                    chai_1.expect(result.has(filename)).to.be.true;
                    chai_1.expect(filename.endsWith('.yml')).to.be.true;
                });
            });
            it(`should not be nested for Map outputs (ex: root.VideoChat.VideoChat.micOn)`, () => {
                const result = nc.loadFiles(pathNameToFixtures, {
                    as: 'map',
                    type: 'doc',
                });
                const keys = Array.from(result.keys());
                chai_1.expect(keys).to.have.length.greaterThan(0);
                for (const key of keys) {
                    const pageObject = result.get(key);
                    chai_1.expect(pageObject?.has(key)).to.be.false;
                }
            });
            it(`should not be nested for object outputs (ex: root.VideoChat.VideoChat.micOn)`, () => {
                const result = nc.loadFiles(pathNameToFixtures, {
                    as: 'object',
                    type: 'doc',
                });
                const keys = u.keys(result);
                chai_1.expect(keys).to.have.length.greaterThan(0);
                for (const key of keys) {
                    const pageObject = result[key];
                    chai_1.expect(pageObject).not.to.have.property(key);
                }
            });
        });
    });
    describe(nc.italic(`normalizePath`), () => {
        it(`should erase the myBaseUrl tilde (~/)`, () => {
            const filepath = `https://public.aitmed.com/cadl/meet3_0.45d/~/HomePageUrl.yml`;
            chai_1.expect(nc.normalizePath(filepath)).to.eq(`https://public.aitmed.com/cadl/meet3_0.45d/HomePageUrl.yml`);
        });
    });
});
//# sourceMappingURL=index.test.js.map