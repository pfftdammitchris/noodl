"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const normalizePath_js_1 = require("./normalizePath.js");
/**
 * Returns the path as an absolute path
 * @param { string[] } paths
 * @returns { string }
 */
function getAbsFilePath(...paths) {
    const filepath = normalizePath_js_1.default(...paths);
    if (path_1.isAbsolute(filepath))
        return filepath;
    return path_1.resolve(normalizePath_js_1.default(process.cwd(), ...paths));
}
exports.default = getAbsFilePath;
//# sourceMappingURL=getAbsFilePath.js.map