"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettifyErr = exports.createConfigURL = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.createConfigURL = (function () {
    const _root = 'https://public.aitmed.com';
    const _ext = 'yml';
    return (configKey) => {
        return `${_root}/config/${configKey}.${_ext}`;
    };
})();
function prettifyErr(err) {
    var _a;
    if ('response' in err) {
        if ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) {
            return `[${chalk_1.default.yellow('AxiosError')}}]: ${err.response.data}`;
        }
    }
    return `[${chalk_1.default.yellow(err.name)}]: ${chalk_1.default.red(err.message)}`;
}
exports.prettifyErr = prettifyErr;
//# sourceMappingURL=common.js.map