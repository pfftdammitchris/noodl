"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/**
 * @param { string } link
 * @param { object } opts
 * @returns { LinkStructure }
 */
function getLinkStructure(link, opts) {
    const parsed = path_1.default.posix.parse(link);
    const structure = {
        ext: parsed.ext,
        filename: parsed.name,
        isRemote: /^(http|www)/i.test(link),
        url: opts?.prefix
            ? `${opts.prefix}${opts.prefix.endsWith('/') ? link : `/${link}`}`
            : link,
    };
    if (opts?.config === structure.filename) {
        structure.group = 'config';
    }
    else if (structure.ext.endsWith('.yml')) {
        structure.group = 'page';
    }
    else if (/.*(bmp|gif|jpg|jpeg|png|tif)$/i.test(structure.ext)) {
        structure.group = 'image';
    }
    else if (/.*(doc|docx|json|pdf)$/i.test(structure.ext)) {
        structure.group = 'document';
    }
    else if (/.*(avi|mp4|mkv|wmv)$/i.test(structure.ext)) {
        structure.group = 'video';
    }
    else if (/.*(html|js)$/i.test(structure.ext)) {
        structure.group = 'script';
    }
    else {
        structure.group = 'unknown';
    }
    return structure;
}
exports.default = getLinkStructure;
//# sourceMappingURL=getLinkStructure.js.map