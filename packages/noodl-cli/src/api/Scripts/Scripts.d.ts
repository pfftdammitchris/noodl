import { OrArray } from '@jsmanifest/typefest';
import yaml from 'yaml';
import * as t from './types.js';
declare class Scripts<Store extends Record<string, any> = Record<string, any>> {
    #private;
    docs: {
        name: string;
        doc: yaml.Document<yaml.Node> | yaml.Document.Parsed<any>;
    }[];
    constructor(opts: {
        dataFilePath: string;
        store?: Store;
        docs?: OrArray<Scripts<Store>['docs'][number]>;
    });
    set dataFilePath(dataFilePath: string);
    get hooks(): Record<keyof t.Script.Hooks<Store>, (((store: Store) => void) | ((store: Store) => void))[]>;
    get store(): Store;
    ensureDataFile(): void;
    get(): any;
    compose(scripts?: ReturnType<t.Script.Register<Store>>[]): (obj: Scripts<Store>['docs'][number]) => (key: number | "key" | "value" | null, node: yaml.Node, path: readonly (yaml.Pair<unknown, unknown> | yaml.Node | yaml.Document<unknown>)[]) => {
        name: string;
        doc: yaml.Document<yaml.Node> | yaml.Document.Parsed<any>;
        key: number | "key" | "value" | null;
        node: yaml.Node;
        path: readonly (yaml.Pair<unknown, unknown> | yaml.Node | yaml.Document<unknown>)[];
    };
    run(): void;
    save(): any;
    use(opts: {
        script?: OrArray<t.Script.Register<Store>>;
        onStart?: t.Script.HooksRegister<Store, 'onStart'>;
        onEnd?: t.Script.HooksRegister<Store, 'onEnd'>;
    }): this;
}
export default Scripts;
