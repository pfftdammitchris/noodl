import { Document } from 'yaml';
import { Node } from 'yaml';
import { YAMLNode } from './types';
export interface NoodlPageOptions {
    name?: string;
    doc?: Document | Document.Parsed;
}
declare class NoodlPage {
    #private;
    doc: Document | Document.Parsed;
    constructor(name: string | Document | NoodlPageOptions, doc?: Document);
    get name(): string;
    set name(name: string);
    contains(node: Node): boolean;
    find(fn: (node: YAMLNode) => boolean): null;
    has(key: Parameters<Document['has']>[0]): boolean;
    hasIn(args: Parameters<Document['hasIn']>[0]): boolean;
    get(key: Parameters<Document['get']>[0], keepScalar?: boolean): unknown;
    getIn(args: Parameters<Document['getIn']>[0], keepScalar?: boolean): unknown;
}
export default NoodlPage;
