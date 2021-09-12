"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("@jsmanifest/utils");
const fs = require("fs-extra");
const path_1 = require("path");
const yaml_1 = require("yaml");
const getAbsFilePath_js_1 = require("./getAbsFilePath.js");
function loadFile(filepath, type) {
    if (u.isStr(filepath)) {
        if (!path_1.default.isAbsolute(filepath))
            filepath = getAbsFilePath_js_1.default(filepath);
        if (fs.existsSync(filepath)) {
            const yml = fs.readFileSync(filepath, 'utf8');
            if (type === 'doc')
                return yaml_1.parseDocument(yml);
            if (type === 'json')
                return yaml_1.parse(yml);
            return fs.readFileSync(filepath, 'utf8');
        }
    }
}
exports.default = loadFile;
//# sourceMappingURL=loadFile.js.map