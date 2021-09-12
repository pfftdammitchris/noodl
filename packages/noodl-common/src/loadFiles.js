"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const globby_1 = require("globby");
const yaml_1 = require("yaml");
const path_1 = require("path");
const getAbsFilePath_js_1 = require("./getAbsFilePath.js");
const getBasename_js_1 = require("./getBasename.js");
const getFileStructure_js_1 = require("./getFileStructure.js");
const loadFile_js_1 = require("./loadFile.js");
const normalizePath_js_1 = require("./normalizePath.js");
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
        const _path = normalizePath_js_1.default(getAbsFilePath_js_1.default(path_1.default.join(dir, glob)));
        if (u.isStr(opts)) {
            type = opts === 'json' ? 'json' : opts === 'doc' ? 'doc' : type;
            return globby_1.sync(_path, { onlyFiles: true }).map((filepath) => loadFile_js_1.default(filepath, type));
        }
        else if (u.isObj(opts)) {
            type = opts.type || type;
            const includeExt = opts?.includeExt;
            const keysToSpread = opts.spread ? u.array(opts.spread) : [];
            function getKey(metadata) {
                return includeExt ? getBasename_js_1.default(metadata.filepath) : metadata.filename;
            }
            function listReducer(acc = [], filepath) {
                return acc.concat(loadFile_js_1.default(filepath, type));
            }
            function mapReducer(acc, filepath) {
                const metadata = getFileStructure_js_1.default(filepath);
                const key = getKey(metadata);
                const data = loadFile_js_1.default(filepath, type);
                yaml_1.isDocument(data) && data.has(key) && (data.contents = data.get(key));
                if (keysToSpread.includes(key)) {
                    if (yaml_1.isDocument(data) && yaml_1.isMap(data.contents)) {
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
                const metadata = getFileStructure_js_1.default(filepath);
                const key = getKey(metadata);
                let data = loadFile_js_1.default(filepath, type);
                u.isObj(data) && key in data && (data = data[key]);
                if (keysToSpread.includes(key) && u.isObj(data)) {
                    if (yaml_1.isDocument(data) && yaml_1.isMap(data.contents)) {
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
            const items = globby_1.sync(_path, { onlyFiles: true });
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
exports.default = loadFiles;
//# sourceMappingURL=loadFiles.js.map