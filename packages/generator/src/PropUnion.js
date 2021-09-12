"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PropUnion {
    constructor() {
        this.options = {
            boolean: 'boolean',
            object: 'Record<string, any>',
            function: '((...args: any[]) => any)',
            number: 'number',
            null: 'null',
            string: 'string',
            undefined: 'undefined',
        };
        this.value = '';
    }
    add(property, val) {
        if (!this.value.includes(property)) {
            this.value += `| ${property}`;
        }
    }
    has(key) {
        if (this.value?.[key])
            return true;
        return false;
    }
}
exports.default = PropUnion;
//# sourceMappingURL=PropUnion.js.map