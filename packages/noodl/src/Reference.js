var _Reference_node, _Reference_prev, _Reference_next, _Reference_ref, _Reference_value;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import yaml from 'yaml';
class Reference {
    constructor(arg) {
        _Reference_node.set(this, void 0);
        _Reference_prev.set(this, void 0);
        _Reference_next.set(this, void 0);
        _Reference_ref.set(this, '');
        _Reference_value.set(this, null);
        this.type = 'REFERENCE';
        __classPrivateFieldSet(this, _Reference_node, yaml.isNode(arg) ? arg : new yaml.Scalar(arg), "f");
        __classPrivateFieldSet(this, _Reference_ref, __classPrivateFieldGet(this, _Reference_node, "f").value, "f");
        __classPrivateFieldSet(this, _Reference_value, null, "f");
        __classPrivateFieldSet(this, _Reference_prev, null, "f");
        __classPrivateFieldSet(this, _Reference_next, null, "f");
    }
    isRoot() {
        return !!this.path && this.path[0].toUpperCase() === this.path[0];
    }
    isLocal() {
        return !!this.path && this.path[0].toLowerCase() === this.path[0];
    }
    get node() {
        return __classPrivateFieldGet(this, _Reference_node, "f");
    }
    set node(node) {
        __classPrivateFieldSet(this, _Reference_node, node, "f");
    }
    get path() {
        return __classPrivateFieldGet(this, _Reference_ref, "f")?.replace?.(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || '';
    }
    get paths() {
        return this.path.split('.');
    }
    get value() {
        return __classPrivateFieldGet(this, _Reference_value, "f");
    }
    set value(value) {
        __classPrivateFieldSet(this, _Reference_value, value || null, "f");
    }
    prev() {
        return __classPrivateFieldGet(this, _Reference_prev, "f");
    }
    next() {
        return __classPrivateFieldGet(this, _Reference_next, "f");
    }
    toJSON() {
        return {
            isRoot: this.isRoot(),
            isLocal: this.isLocal(),
            path: this.path,
            paths: this.paths,
            value: __classPrivateFieldGet(this, _Reference_value, "f"),
        };
    }
    toString() {
        return __classPrivateFieldGet(this, _Reference_ref, "f");
    }
}
_Reference_node = new WeakMap(), _Reference_prev = new WeakMap(), _Reference_next = new WeakMap(), _Reference_ref = new WeakMap(), _Reference_value = new WeakMap();
export default Reference;
//# sourceMappingURL=Reference.js.map