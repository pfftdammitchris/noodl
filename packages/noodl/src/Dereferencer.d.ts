import { Scalar, YAMLMap } from 'yaml';
import { YAMLNode } from './types';
import NoodlUtils from './Utils';
import NoodlPage from './Page';
import * as T from './types';
declare class Dereferencer {
    #private;
    constructor({ pages, root, util, }: {
        pages: T.InternalComposerBaseArgs['pages'];
        root: T.InternalComposerBaseArgs['root'];
        util?: NoodlUtils;
    });
    getReference(ref: string, rootNode?: YAMLNode | NoodlPage): any;
    getLocalReference(node: string | Scalar, { keepScalar, page, }: {
        keepScalar?: boolean;
        page: YAMLMap | NoodlPage;
    }): unknown;
    getRootReference(node: Scalar | string, { keepScalar }?: {
        keepScalar?: boolean;
    }): any;
}
export default Dereferencer;
