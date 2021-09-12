"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/**
 * Returns the base name of the file path. A base name contains the file name
 * including its ext
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
function getBasename(str = '', ext) {
    if (!ext)
        return path_1.default.posix.basename(str);
    return path_1.default.posix.basename(str, ext.startsWith('.') ? ext : `.${ext}`);
}
exports.default = getBasename;
//# sourceMappingURL=getBasename.js.map