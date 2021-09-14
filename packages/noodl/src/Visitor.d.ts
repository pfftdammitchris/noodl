import { Node } from 'yaml';
import yaml from 'yaml';
import Page from './Page';
import Root from './Root';
import Utils from './Utils';
import * as T from './types';
declare class NoodlVisitor implements T.InternalComposerBaseArgs {
    #private;
    pages: T.InternalComposerBaseArgs['pages'];
    root: T.InternalComposerBaseArgs['root'];
    util: Utils;
    constructor({ pages, root, util, }: {
        pages: T.Pages;
        root: Root;
        util?: Utils;
    });
    visit<N extends Page>(node: N, visitor: T.NoodlVisitor.Visit): N;
    visit<N extends Node>(node: N, visitor: T.NoodlVisitor.Visit): N;
    visit<N extends yaml.Document>(node: N, visitor: T.NoodlVisitor.Visit): N;
}
export default NoodlVisitor;
