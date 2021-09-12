import { Document, Scalar, Pair, YAMLMap } from 'yaml';
import * as t from './Metadata/types.js';
export declare const createVisitor: (visitor: t.Visitor<any, any>) => t.VisitorMapping<any> | {
    Node: (agg: import("noodl-aggregator/dist/noodl-aggregator").default) => t.VisitFn<any, any>;
};
export declare function logError(error: unknown): void;
export declare function purgeRootConfig(rootConfig: Document | Document.Parsed, replacer?: (str: string) => string): Document<unknown> | Document.Parsed<import("yaml").ParsedNode>;
export declare const is: {
    scalar: {
        actionType: (node: unknown) => node is Scalar<"actionType">;
    };
    pair: {
        actionType: (node: unknown) => node is Pair<"actionType", any>;
    };
    map: {
        action: (node: unknown) => node is YAMLMap<"actionType", any>;
        component: (node: unknown) => node is YAMLMap<"type" | "style" | "children", any>;
        emit: (node: unknown) => node is YAMLMap<"emit", any>;
        goto: (node: unknown) => node is YAMLMap<"goto", any>;
    };
    seq: {};
};
export declare function throwError(err: unknown): void;
export declare function getSuccessResponse(body?: Record<string, any>, options?: Record<string, any>): {
    statusCode: number;
    body: string;
};
export declare function getErrorResponse(error: unknown, options?: Record<string, any>): {
    statusCode: number;
    body: string;
};
