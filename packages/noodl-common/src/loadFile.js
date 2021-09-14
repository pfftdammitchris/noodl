import * as u from '@jsmanifest/utils';
import * as fs from 'fs-extra';
import path from 'path';
import { parse as parseYmlToJson, parseDocument as parseYmlToDoc, } from 'yaml';
import getAbsFilePath from './getAbsFilePath.js';
function loadFile(filepath, type) {
    if (u.isStr(filepath)) {
        if (!path.isAbsolute(filepath))
            filepath = getAbsFilePath(filepath);
        if (fs.existsSync(filepath)) {
            const yml = fs.readFileSync(filepath, 'utf8');
            if (type === 'doc')
                return parseYmlToDoc(yml);
            if (type === 'json')
                return parseYmlToJson(yml);
            return fs.readFileSync(filepath, 'utf8');
        }
    }
}
export default loadFile;
//# sourceMappingURL=loadFile.js.map