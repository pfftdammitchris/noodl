import yaml from 'yaml';
import { LiteralUnion } from 'type-fest';
export declare namespace Script {
    interface Register<Store extends Record<string, any>, Key extends keyof Store = keyof Store, Type extends ScriptDataType = ScriptDataType> {
        (store: Store & Record<Key, Type extends 'array' ? any[] : Type extends 'map' ? Map<any, any> : Type extends 'object' ? Record<string, any> : any[]>): Config<Store, Key, Type>;
    }
    type ScriptDataType = 'array' | 'map' | 'object';
    interface ComposableTransduce {
        (args: Parameters<ConsumerFunc>[0]): (step: <V>(val: V) => V) => ConsumerFunc;
    }
    interface ConsumerFunc {
        (visitorArgs: {
            name: string;
            doc: yaml.Document | yaml.Document.Parsed<any>;
            key: Parameters<yaml.visitorFn<any>>[0];
            node: yaml.Node;
            path: Parameters<yaml.visitorFn<any>>[2];
        }): ReturnType<yaml.visitorFn<any>>;
    }
    interface Config<Store extends Record<string, any>, Key extends keyof Store, Type extends ScriptDataType> {
        key: Key;
        type?: LiteralUnion<Type, string>;
        label?: string;
        cond?: 'scalar' | 'pair' | 'map' | 'seq' | ((node: yaml.Node) => boolean);
        fn: ConsumerFunc;
    }
    interface Hooks<Store extends Record<string, any>> {
        onStart(store: Store): void;
        onEnd(store: Store): void;
    }
    type HooksRegister<Store extends Record<string, any> = Record<string, any>, HookKey extends keyof Hooks<Store> = keyof Hooks<Store>> = Hooks<Store>[HookKey] | Hooks<Store>[HookKey][];
    interface Metadata {
        page?: string;
    }
}
