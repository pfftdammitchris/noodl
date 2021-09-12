import { Node } from 'yaml';
import { InternalComposerBaseArgs, YAMLNode } from './internalTypes';
import Page from '../Page';
import NoodlUtils from '../Utils';
import Transformer from '../Transformer';
export declare namespace OriginalVisitor {
    type ArgsList<N extends Node = Node> = [
        key: null | number | 'key' | 'value',
        node: N,
        path: Node[]
    ];
    interface ArgsObject<N extends Node = Node> {
        key: ArgsList[0];
        node: ArgsList<N>[1];
        path: ArgsList[2];
    }
    type ReturnType = number | symbol | void | Node;
}
export declare namespace NoodlTransformer {
    interface Execute<N extends Node | YAMLNode = Node | YAMLNode> {
        (this: Transformer, node: N, util: NoodlVisitor.Utils): void;
    }
}
export declare namespace NoodlVisitor {
    type Utils = NoodlUtils;
    interface Visit {
        (args: Args[0], util: Args[1]): OriginalVisitor.ReturnType;
    }
    type Args = [
        {
            node: Node;
        } & InternalComposerBaseArgs & OriginalVisitor.ArgsObject,
        Utils
    ];
}
export declare type Pages = Map<string, Page>;
