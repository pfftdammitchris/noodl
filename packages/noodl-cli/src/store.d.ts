import ConfigStore from 'configstore';
import { LiteralUnion } from 'type-fest';
export interface Store<O extends Record<string, any>, K extends keyof O = keyof O> extends Omit<ConfigStore, 'get' | 'has' | 'set'> {
    all(): Record<LiteralUnion<K, string>, any>;
    delete<Key extends string = string>(key: LiteralUnion<K | Key, string>): void;
    get<Key extends string = string>(key: LiteralUnion<K | Key, string>): Key extends K ? O[K] : any;
    has<Key extends string = string>(key: LiteralUnion<K | Key, string>): void;
    set<Key extends string = string>(key: LiteralUnion<K | Key, string>, value: Key extends K ? O[K] : any): any;
}
declare const store: ConfigStore;
export default store;
