import { Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml';
import Root from '../Root';
import { Pages } from './types';
export interface InternalComposerBaseArgs {
    pages: Pages;
    root: Root;
}
export declare type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq;
