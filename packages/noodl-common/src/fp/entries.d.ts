import { YAMLMap } from 'yaml';
import { KeyOf, ValueOf } from '../types.js';
declare function entries<N extends YAMLMap>(v: N): [key: KeyOf<N>, value: ValueOf<N>][];
declare function entries<O extends Record<string, any>>(v: O): [key: keyof O, value: O[keyof O]][];
export default entries;
