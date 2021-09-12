"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const isImage_js_1 = require("./isImage.js");
const isVideo_js_1 = require("./isVideo.js");
/**
 * @param { string } filepath
 * @param { object } opts
 * @param { string } [opts.config]
 * @returns { FileStructure }
 */
function getFileStructure(filepath, opts) {
    const parsed = path_1.default.parse(filepath);
    const structure = {
        dir: parsed.dir,
        ext: parsed.ext,
        filename: parsed.name,
        filepath,
        rootDir: parsed.root,
    };
    if (structure.ext === '.yml') {
        if (opts?.config &&
            (opts?.config === parsed.name || opts?.config === parsed.base)) {
            structure.group = 'config';
        }
        else {
            structure.group = 'page';
        }
    }
    else if (isImage_js_1.default(parsed.base)) {
        structure.group = 'image';
    }
    else if (structure.ext === '.js') {
        structure.group = 'script';
    }
    else if (/[./]*(doc|docx|json|pdf)$/i.test(parsed.base)) {
        structure.group = 'document';
    }
    else if (isVideo_js_1.default(parsed.base)) {
        structure.group = 'video';
    }
    else {
        structure.group = 'unknown';
    }
    return structure;
}
exports.default = getFileStructure;
//# sourceMappingURL=getFileStructure.js.map