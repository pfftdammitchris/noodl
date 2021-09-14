var _Scripts_store, _Scripts_scripts, _Scripts_dataFilePath, _Scripts_hooks;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import curry from 'lodash/curry.js';
import * as u from '@jsmanifest/utils';
import * as tds from 'transducers-js';
import invariant from 'invariant';
import yaml from 'yaml';
import chunk from 'lodash/chunk.js';
import fs from 'fs-extra';
import * as co from '../../utils/color.js';
const log = console.log;
const tag = (s) => `[${co.cyan(s)}]`;
class Scripts {
    constructor(opts) {
        _Scripts_store.set(this, {});
        _Scripts_scripts.set(this, []);
        _Scripts_dataFilePath.set(this, '');
        _Scripts_hooks.set(this, { onStart: [], onEnd: [] });
        this.docs = [];
        __classPrivateFieldSet(this, _Scripts_dataFilePath, opts.dataFilePath || '', "f");
        opts.docs && u.array(opts.docs).forEach((doc) => this.docs.push(doc));
    }
    [(_Scripts_store = new WeakMap(), _Scripts_scripts = new WeakMap(), _Scripts_dataFilePath = new WeakMap(), _Scripts_hooks = new WeakMap(), Symbol.for('nodejs.util.inspect.custom'))]() {
        return {
            dataFilePath: __classPrivateFieldGet(this, _Scripts_dataFilePath, "f"),
            hooks: __classPrivateFieldGet(this, _Scripts_hooks, "f"),
            numDocs: this.docs.length,
            observers: u
                .entries(__classPrivateFieldGet(this, _Scripts_hooks, "f"))
                .reduce((acc, [hook, fns]) => u.assign(acc, { [hook]: fns?.length || 0 }), {}),
        };
    }
    set dataFilePath(dataFilePath) {
        __classPrivateFieldSet(this, _Scripts_dataFilePath, dataFilePath, "f");
        this.ensureDataFile();
    }
    get hooks() {
        return __classPrivateFieldGet(this, _Scripts_hooks, "f");
    }
    get store() {
        return __classPrivateFieldGet(this, _Scripts_store, "f");
    }
    ensureDataFile() {
        if (__classPrivateFieldGet(this, _Scripts_dataFilePath, "f") && !fs.existsSync(__classPrivateFieldGet(this, _Scripts_dataFilePath, "f"))) {
            fs.ensureFileSync(__classPrivateFieldGet(this, _Scripts_dataFilePath, "f"));
            fs.writeJsonSync(__classPrivateFieldGet(this, _Scripts_dataFilePath, "f"), __classPrivateFieldGet(this, _Scripts_store, "f"), { spaces: 2 });
            __classPrivateFieldSet(this, _Scripts_store, this.get(), "f");
        }
    }
    get() {
        if (__classPrivateFieldGet(this, _Scripts_dataFilePath, "f")) {
            try {
                return fs.readJsonSync(__classPrivateFieldGet(this, _Scripts_dataFilePath, "f"));
            }
            catch (error) {
                console.error(error);
            }
        }
        return null;
    }
    compose(scripts) {
        const configs = scripts || __classPrivateFieldGet(this, _Scripts_scripts, "f");
        const useCurriedTransformComposer = curry((fn, step, args) => {
            fn(args);
            return step(args);
        });
        const registeredScripts = configs.map((config) => useCurriedTransformComposer(config.fn));
        const createTransform = tds.comp(...(registeredScripts.length == 1 ? [tds.identity] : []), ...registeredScripts);
        const step = (args) => args;
        const transform = createTransform(step);
        invariant(u.isFnc(transform), `The composed ${u.magenta('transform')} function is not a function. ` +
            `Received ${u.red(typeof transform)} instead`);
        function onTransform(obj) {
            return (...[key, node, path]) => {
                return transform({
                    name: obj.name,
                    doc: obj.doc,
                    key,
                    node,
                    path,
                });
            };
        }
        return onTransform;
    }
    run() {
        invariant(u.isArr(this.docs), `The list of yml docs is not an array`);
        invariant(!!this.docs.length, `There are no yml docs to run with`);
        __classPrivateFieldGet(this, _Scripts_hooks, "f").onStart.forEach((fn) => {
            invariant(u.isFnc(fn), `onStart fn is not a function`);
            fn(__classPrivateFieldGet(this, _Scripts_store, "f"));
        });
        const chunkedDocs = chunk(this.docs, 8);
        const composed = this.compose();
        log(`${tag('Chunks')} ${co.magenta(chunkedDocs.length)} total chunks were created from ${co.magenta(this.docs.length)} yml docs`);
        for (const docs of chunkedDocs) {
            for (const obj of docs) {
                // @ts-expect-error
                yaml.visit(obj.doc, composed(obj));
            }
        }
        __classPrivateFieldGet(this, _Scripts_hooks, "f").onEnd.forEach((fn) => {
            invariant(u.isFnc(fn), `onEnd fn is not a function`);
            fn(__classPrivateFieldGet(this, _Scripts_store, "f"));
        });
        this.save();
    }
    save() {
        if (__classPrivateFieldGet(this, _Scripts_dataFilePath, "f")) {
            try {
                fs.writeJsonSync(__classPrivateFieldGet(this, _Scripts_dataFilePath, "f"), __classPrivateFieldGet(this, _Scripts_store, "f"), { spaces: 2 });
            }
            catch (error) {
                console.error(error);
            }
        }
        return this.get();
    }
    use(opts) {
        opts.onStart && __classPrivateFieldGet(this, _Scripts_hooks, "f").onStart.push(...u.array(opts.onStart));
        opts.onEnd && __classPrivateFieldGet(this, _Scripts_hooks, "f").onEnd.push(...u.array(opts.onEnd));
        opts.script &&
            __classPrivateFieldGet(this, _Scripts_scripts, "f").push(...u.array(opts.script).map((config) => {
                invariant(u.isFnc(config), `Expected a script register function to "use" but received ${typeof config}`);
                const _config = config(__classPrivateFieldGet(this, _Scripts_store, "f"));
                invariant(!!_config.key, `Missing script ${co.italic(co.yellow(`key`))}`);
                !_config.type && (_config.type = 'array');
                __classPrivateFieldGet(this, _Scripts_store, "f")[_config.key] =
                    _config.type === 'map'
                        ? new Map()
                        : _config.type === 'object'
                            ? {}
                            : [];
                return _config;
            }));
        return this;
    }
}
export default Scripts;
//# sourceMappingURL=Scripts.js.map