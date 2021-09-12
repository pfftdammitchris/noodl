"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/**
 * Normalizes the path (compatible with win). Useful for globs to work
 * expectedly
 * @param s
 * @returns { string }
 */
function normalizePath(...s) {
    let result = (s.length > 1 ? path_1.default.join(...s) : s[0]).replace(/\\/g, '/');
    if (result.includes('/~/'))
        result = result.replace('~/', '');
    return result;
}
exports.default = normalizePath;
//# sourceMappingURL=normalizePath.js.map