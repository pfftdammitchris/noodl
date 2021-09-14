import yaml, { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';
export declare function has(path: string[], node: unknown): boolean;
export declare function has(path: string, node: unknown): boolean;
export declare const hasNoodlPlaceholder: (str: string | undefined) => boolean;
export declare function hasPaths(opts: {
    paths?: string[][];
    required?: string[][];
}, node: unknown): boolean;
export declare function hasPaths(paths: string[][], node: unknown): boolean;
export declare function isValidAsset(value: string | undefined): boolean;
export declare function isActionObj(node: YAMLMap): boolean;
export declare function isBuiltInObj(node: YAMLMap): boolean;
export declare function isComponentObj(node: YAMLMap): boolean;
export declare function isEmitObj(node: YAMLMap): boolean;
export declare function isIfObj(node: YAMLMap): boolean;
export declare function isPageDocument(node: unknown): node is yaml.Document<YAMLMap>;
export declare function isYAMLNode(type: 'pair', node: any): node is Pair;
export declare function isYAMLNode(type: 'scalar', node: any): node is Scalar;
export declare function isYAMLNode(type: 'map', node: any): node is YAMLMap;
export declare function isYAMLNode(type: 'seq', node: any): node is YAMLSeq;
export declare function createPlaceholderReplacer(placeholders: string | string[], flags?: string): {
    (str: string, value: string | number): string;
    <Obj extends Record<string, any> = any>(obj: Obj, value: string | number): Obj;
};
export declare const replaceBaseUrlPlaceholder: {
    (str: string, value: string | number): string;
    <Obj extends Record<string, any> = any>(obj: Obj, value: string | number): Obj;
};
export declare const replaceDesignSuffixPlaceholder: {
    (str: string, value: string | number): string;
    <Obj extends Record<string, any> = any>(obj: Obj, value: string | number): Obj;
};
export declare const replaceTildePlaceholder: {
    (str: string, value: string | number): string;
    <Obj extends Record<string, any> = any>(obj: Obj, value: string | number): Obj;
};
export declare const replaceVersionPlaceholder: {
    (str: string, value: string | number): string;
    <Obj extends Record<string, any> = any>(obj: Obj, value: string | number): Obj;
};
export declare const createNoodlPlaceholderReplacer: (keyMap: {
    cadlBaseUrl?: any;
    cadlVersion?: any;
    designSuffix?: any;
}) => (...args: any[]) => any;
