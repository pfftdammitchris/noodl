import * as u from '@jsmanifest/utils';
import { sync as globbySync } from 'globby';
import { isDocument, isMap } from 'yaml';
import path from 'path';
import getAbsFilePath from './getAbsFilePath.js';
import getBasename from './getBasename.js';
import getFileStructure from './getFileStructure.js';
import loadFile from './loadFile.js';
import normalizePath from './normalizePath.js';
/**
 *
 * @param { string } args
 */
function loadFiles(dir, opts = 'yml') {
    let ext = 'yml';
    let type = 'yml';
    if (u.isStr(dir)) {
        opts === 'json' && (ext = 'json');
        const glob = `**/*.${ext}`;
        const _path = normalizePath(getAbsFilePath(path.join(dir, glob)));
        if (u.isStr(opts)) {
            type = opts === 'json' ? 'json' : opts === 'doc' ? 'doc' : type;
            return globbySync(_path, { onlyFiles: true }).map((filepath) => loadFile(filepath, type));
        }
        else if (u.isObj(opts)) {
            type = opts.type || type;
            const includeExt = opts?.includeExt;
            const keysToSpread = opts.spread ? u.array(opts.spread) : [];
            function getKey(metadata) {
                return includeExt ? getBasename(metadata.filepath) : metadata.filename;
            }
            function listReducer(acc = [], filepath) {
                return acc.concat(loadFile(filepath, type));
            }
            function mapReducer(acc, filepath) {
                const metadata = getFileStructure(filepath);
                const key = getKey(metadata);
                const data = loadFile(filepath, type);
                isDocument(data) && data.has(key) && (data.contents = data.get(key));
                if (keysToSpread.includes(key)) {
                    if (isDocument(data) && isMap(data.contents)) {
                        for (const item of data.contents.items) {
                            const itemKey = item.key;
                            acc.set(itemKey.value, item.value);
                        }
                    }
                    else if (u.isObj(data)) {
                        for (const [key, value] of u.entries(data))
                            acc.set(key, value);
                    }
                }
                else {
                    acc.set(key, data);
                }
                return acc;
            }
            function objectReducer(acc, filepath) {
                const metadata = getFileStructure(filepath);
                const key = getKey(metadata);
                let data = loadFile(filepath, type);
                u.isObj(data) && key in data && (data = data[key]);
                if (keysToSpread.includes(key) && u.isObj(data)) {
                    if (isDocument(data) && isMap(data.contents)) {
                        data.contents.items.forEach((pair) => {
                            acc[String(pair.key)] = pair.value;
                        });
                    }
                    else if (u.isObj(data)) {
                        u.assign(acc, data);
                    }
                }
                else {
                    acc[key] = data;
                }
                return acc;
            }
            const items = globbySync(_path, { onlyFiles: true });
            if (opts.as === 'list')
                return u.reduce(items, listReducer, []);
            if (opts.as === 'map')
                return u.reduce(items, mapReducer, new Map());
            return u.reduce(items, objectReducer, {});
        }
    }
    else if (u.isObj(dir)) {
        //
    }
}
export default loadFiles;
//# sourceMappingURL=loadFiles.js.map