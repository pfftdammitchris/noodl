"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbortExecuteError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AbortExecuteError';
    }
}
exports.default = AbortExecuteError;
//# sourceMappingURL=AbortExecuteError.js.map