"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    reference: {
        at: {
            apply: /[a-zA-Z0-9]+@$/,
        },
        dot: {
            single: {
                root: /(^\.[A-Z])/,
                localRoot: /^([\s]*\.[a-z])/,
            },
            double: {
                root: /(^\.\.[A-Z])/,
                localRoot: /^([\s]*\.\.[a-z])/,
            },
        },
        eq: {
            eval: /^[\s]*=([a-zA-Z]+|\.{1,2}[a-zA-Z]+)/,
        },
        underline: {
            traverse: /([\.][_]+[a-zA-Z])/,
        },
    },
};
//# sourceMappingURL=regex.js.map