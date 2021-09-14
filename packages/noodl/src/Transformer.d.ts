import yaml from 'yaml';
import NoodlRoot from './Root';
import * as T from './types';
export declare const _noodlSpecTransformers: {
    reference: T.NoodlTransformer.Execute<yaml.Node | T.YAMLNode>;
};
declare class Transformer implements T.InternalComposerBaseArgs {
    #private;
    pages: T.InternalComposerBaseArgs['pages'];
    root: T.InternalComposerBaseArgs['root'];
    util: T.NoodlVisitor.Utils;
    transforms: T.NoodlTransformer.Execute<yaml.Node | T.YAMLNode>[];
    constructor({ pages, root, util, }: {
        pages: T.Pages;
        root: NoodlRoot;
        util?: T.NoodlVisitor.Utils;
    });
    get transform(): (node: yaml.Node) => any;
    compose(...transforms: T.NoodlTransformer.Execute[]): any;
    createTransform(fn: T.NoodlTransformer.Execute): this;
}
export default Transformer;
