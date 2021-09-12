"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const globby_1 = require("globby");
const test_utils_1 = require("./utils/test-utils");
const ymlFiles = globby_1.default
    .sync(path_1.default.resolve(path_1.default.join(__dirname, './__tests__/fixtures'), `**/*.yml`), { objectMode: true, onlyFiles: true })
    .map((file) => ({
    name: file.name,
    yml: fs_extra_1.default.readFileSync(file.path, 'utf8'),
}));
beforeEach(() => {
    ymlFiles.map(({ name, yml }) => {
        name = name.substring(0, name.indexOf('.'));
        test_utils_1.noodl.createPage({
            name,
            doc: yaml_1.default.parseDocument(yml),
            spread: /(BaseCSS|BaseDataModel)/.test(name),
        });
    });
});
afterEach(() => {
    test_utils_1.noodl.clear();
});
//# sourceMappingURL=setupTests.js.map