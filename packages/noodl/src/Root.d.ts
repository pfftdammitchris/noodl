import { Document as YAMLDocument, YAMLMap } from 'yaml';
import { LoadFilesOptions, LoadFilesAs, LoadType } from 'noodl-common';
import { YAMLNode } from './types/internalTypes';
import Page from './Page';
interface RootItems {
    [key: string]: Page | YAMLNode;
}
declare class NoodlRoot<Type extends LoadType = 'yml', As extends LoadFilesAs = 'list'> {
    #private;
    [Symbol.iterator](): {
        next(): {
            done: boolean;
            value: [string, unknown];
        };
    };
    constructor({ docs, loadOptions, }: {
        docs: YAMLDocument[];
        loadOptions: Partial<LoadFilesOptions>;
    });
    get Global(): YAMLMap<unknown, unknown> | undefined;
    get userVertex(): YAMLMap<unknown, unknown> | undefined;
    get(name?: never): RootItems;
    get<Key extends string>(name: Key): RootItems[Key];
    getIn(path: string | string[]): unknown;
    has(key: string): boolean;
    set(opts: {
        key: string;
    } & PropertyDescriptor, value?: never): this;
    set(key: string, value: any): this;
    clear(): void;
}
export default NoodlRoot;
