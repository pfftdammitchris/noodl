import yaml from 'yaml';
import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';
import { noodl } from './utils/test-utils';
const ymlFiles = globby
    .sync(path.resolve(path.join(__dirname, './__tests__/fixtures'), `**/*.yml`), { objectMode: true, onlyFiles: true })
    .map((file) => ({
    name: file.name,
    yml: fs.readFileSync(file.path, 'utf8'),
}));
beforeEach(() => {
    ymlFiles.map(({ name, yml }) => {
        name = name.substring(0, name.indexOf('.'));
        noodl.createPage({
            name,
            doc: yaml.parseDocument(yml),
            spread: /(BaseCSS|BaseDataModel)/.test(name),
        });
    });
});
afterEach(() => {
    noodl.clear();
});
//# sourceMappingURL=setupTests.js.map