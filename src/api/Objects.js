"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = __importDefault(require("yaml"));
const axios_1 = __importDefault(require("axios"));
const common_1 = require("../utils/common");
class NOODLObjects {
    constructor(name = '') {
        this.objects = {};
        this.options = { keepYml: false };
        this.name = name;
    }
    get(key, { asYml } = {}) {
        var _a, _b;
        if (key) {
            if (typeof key === 'string') {
                return asYml ? (_a = this.objects[key]) === null || _a === void 0 ? void 0 : _a.yml : (_b = this.objects[key]) === null || _b === void 0 ? void 0 : _b.json;
            }
            else if (key instanceof RegExp) {
                const results = {};
                const keys = Object.keys(this.objects);
                for (let index = 0; index < keys.length; index++) {
                    const k = keys[index];
                    if (key.test(k))
                        results[k] = this.objects[k];
                }
                return results;
            }
        }
    }
    async load(name, url) {
        try {
            const { data: yml } = await axios_1.default.get(url);
            this.objects[name] = { json: yaml_1.default.parse(yml) };
            this.objects[name]['yml'] = this.options.keepYml ? yml : '';
            return this.objects[name];
        }
        catch (error) {
            common_1.prettifyErr(error);
        }
    }
}
exports.default = NOODLObjects;
//# sourceMappingURL=Objects.js.map