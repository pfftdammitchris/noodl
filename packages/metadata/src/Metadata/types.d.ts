import yaml from 'yaml';
import NoodlAggregator from 'noodl-aggregator';
export declare type ParsedDocument = yaml.Document | yaml.Document.Parsed;
export declare type VisitorKey<T = any> = Parameters<yaml.visitorFn<T>>[0];
export declare type VisitorNode<T = any> = Parameters<yaml.visitorFn<T>>[1];
export declare type VisitorPath<T = any> = Parameters<yaml.visitorFn<T>>[2];
export interface VisitArgs<N extends VisitorNode> {
    label?: string;
    doc: ParsedDocument;
    key: VisitorKey;
    node: N;
    path: VisitorPath;
}
export interface VisitFn<N extends VisitorNode = VisitorNode, C = any> {
    (args: VisitArgs<N>, context: C): ReturnType<yaml.visitorFn<N>>;
}
export interface VisitorCreation<C = any, O extends Record<string, any> = Record<string, any>> {
    (aggregator: NoodlAggregator, options?: O): {
        context: C;
        visit: Visitor<any, C>;
    };
}
export declare type Visitor<N extends VisitorNode, C = any> = VisitorMapping<C> | ((agg: NoodlAggregator) => VisitFn<N, C>);
export interface VisitorMapping<C = any> {
    Node?: VisitFn<yaml.Node, C>;
    Scalar?: VisitFn<yaml.Scalar, C>;
    Pair?: VisitFn<yaml.Pair, C>;
    Map?: VisitFn<yaml.YAMLMap, C>;
    Seq?: VisitFn<yaml.YAMLSeq, C>;
}
