"use strict";
var _Reference_node, _Reference_prev, _Reference_next, _Reference_ref, _Reference_value;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("yaml");
class Reference {
    constructor(arg) {
        _Reference_node.set(this, void 0);
        _Reference_prev.set(this, void 0);
        _Reference_next.set(this, void 0);
        _Reference_ref.set(this, '');
        _Reference_value.set(this, null);
        this.type = 'REFERENCE';
        tslib_1.__classPrivateFieldSet(this, _Reference_node, yaml_1.default.isNode(arg) ? arg : new yaml_1.default.Scalar(arg), "f");
        tslib_1.__classPrivateFieldSet(this, _Reference_ref, tslib_1.__classPrivateFieldGet(this, _Reference_node, "f").value, "f");
        tslib_1.__classPrivateFieldSet(this, _Reference_value, null, "f");
        tslib_1.__classPrivateFieldSet(this, _Reference_prev, null, "f");
        tslib_1.__classPrivateFieldSet(this, _Reference_next, null, "f");
    }
    isRoot() {
        return !!this.path && this.path[0].toUpperCase() === this.path[0];
    }
    isLocal() {
        return !!this.path && this.path[0].toLowerCase() === this.path[0];
    }
    get node() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_node, "f");
    }
    set node(node) {
        tslib_1.__classPrivateFieldSet(this, _Reference_node, node, "f");
    }
    get path() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_ref, "f")?.replace?.(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || '';
    }
    get paths() {
        return this.path.split('.');
    }
    get value() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_value, "f");
    }
    set value(value) {
        tslib_1.__classPrivateFieldSet(this, _Reference_value, value || null, "f");
    }
    prev() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_prev, "f");
    }
    next() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_next, "f");
    }
    toJSON() {
        return {
            isRoot: this.isRoot(),
            isLocal: this.isLocal(),
            path: this.path,
            paths: this.paths,
            value: tslib_1.__classPrivateFieldGet(this, _Reference_value, "f"),
        };
    }
    toString() {
        return tslib_1.__classPrivateFieldGet(this, _Reference_ref, "f");
    }
}
_Reference_node = new WeakMap(), _Reference_prev = new WeakMap(), _Reference_next = new WeakMap(), _Reference_ref = new WeakMap(), _Reference_value = new WeakMap();
exports.default = Reference;
//# sourceMappingURL=Reference.js.map