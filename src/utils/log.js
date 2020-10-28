"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divider = void 0;
exports.divider = '----------------------------------------------------------------------';
const log = process.env.NODE_ENV === 'production'
    ? Object.create(console.log)
    : console.log;
Object.defineProperties(log, {
    attention: {
        value(msg) {
            log.blank();
            console.log(exports.divider);
            console.log(msg || '');
            console.log(exports.divider);
            log.blank();
            return log;
        },
    },
    blank: {
        value() {
            console.log('');
            return log;
        },
    },
});
exports.default = log;
//# sourceMappingURL=log.js.map