export var __esModule: boolean;
export function createNoodlPlaceholderReplacer(keyMap: any): any;
export function hasNoodlPlaceholder(str: any): boolean;
export var deviceTypes: string[];
export default NoodlUtilsParser;
export var Parser: any;
export function array(o: any): any;
export function isArr(v: any): boolean;
export function isBool(v: any): boolean;
export function isObj(v: any): boolean;
declare function isNum3(v: any): boolean;
declare function isStr2(v: any): boolean;
export function isUnd(v: any): boolean;
declare function isFnc2(v: any): boolean;
export function unwrapObj(obj: any): any;
export function createPlaceholderReplacer(placeholders: any, flags: any): (str: any, value: any) => any;
export function createEmitDataKey(dataKey: any, dataObject: any, opts: any): any;
export function excludeIteratorVar(dataKey: any, iteratorVar?: string): any;
export function evalIf(fn: any, ifObj: any): any;
export function findDataValue(objs: any, path: any): any;
export function findReferences(obj: any): any[];
export function getDataValue(dataObject: any, dataKey: any, opts: any): any;
export function isOutboundLink(s?: string): boolean;
export function isRootDataKey(dataKey: any): boolean;
export function isSerializableStr(value: any): any;
export function isStable(): boolean;
export function isTest(): boolean;
export function isValidAsset(value: any): any;
export function trimReference(v: any, fixType: any): any;
declare var NoodlUtilsParser: {
    new (): {
        configVersion(configObject: any, deviceType: any, env: any): any;
        appConfigUrl(baseUrl: any, cadlMain: any, env: any, ...args: any[]): any;
        destination(destination: any, { denoter, duration }?: {
            denoter?: string | undefined;
            duration?: number | undefined;
        }): {
            destination: string;
            duration: number;
            id: string;
        } | {
            targetPage: any;
            currentPage: any;
            viewTag: any;
        };
        queryString({ destination, pageUrl, startPage }: {
            destination?: string | undefined;
            pageUrl?: string | undefined;
            startPage?: string | undefined;
        }): string;
    };
};
export var ALIAS: symbol;
export var DOC: symbol;
export var MAP: symbol;
export var NODE_TYPE: symbol;
export var NodeBase: {
    new (type: any): {};
};
export var PAIR: symbol;
export var SCALAR: string;
export var SEQ: symbol;
export function hasAnchor(node: any): boolean;
export var Directives: {
    new (yaml2: any, tags: any): {
        marker: any;
        yaml: any;
        tags: any;
        atDocument(): any;
        atNextDocument: boolean | undefined;
        add(line: any, onError: any): boolean;
        tagName(source: any, onError: any): any;
        tagString(tag: any): any;
        toString(doc: any): string;
    };
    defaultYaml: {
        explicit: boolean;
        version: string;
    };
    defaultTags: {
        "!!": string;
    };
};
export function anchorIsValid(anchor: any): boolean;
export function anchorNames(root: any): Set<any>;
export function createNodeAnchors(doc: any, prefix: any): {
    onAnchor(source: any): string;
    setAnchors(): void;
    sourceObjects: Map<any, any>;
};
export function findNewAnchor(prefix: any, exclude: any): string;
export function toJS(value: any, arg: any, ctx: any): any;
export function isScalarValue(value: any): boolean;
export function createNode(value: any, tagName: any, ctx: any): any;
export var Collection: {
    new (type: any, schema: any): {
        [x: string]: any;
        addIn(path: any, value: any): void;
        deleteIn([key, ...rest]: [any, ...any[]]): any;
        getIn([key, ...rest]: [any, ...any[]], keepScalar: any): any;
        hasAllNullValues(allowScalar: any): any;
        hasIn([key, ...rest]: [any, ...any[]]): any;
        setIn([key, ...rest]: [any, ...any[]], value: any): void;
    };
    [x: string]: any;
    maxFlowStringSingleLineLength: number;
};
export function collectionFromPath(schema: any, path: any, value: any): any;
export function isEmptyPath(path: any): boolean;
export var FOLD_BLOCK: string;
export var FOLD_FLOW: string;
export var FOLD_QUOTED: string;
export function foldFlowLines(text: any, indent: any, mode?: string, { indentAtStart, lineWidth, minContentWidth, onFold, onOverflow }?: {
    indentAtStart: any;
    lineWidth?: number | undefined;
    minContentWidth?: number | undefined;
    onFold: any;
    onOverflow: any;
}): any;
export function stringifyString(item: any, ctx: any, onComment: any, onChompKeep: any): any;
export function createStringifyContext(doc: any, options: any): {
    anchors: Set<any>;
    doc: any;
    indent: string;
    indentStep: string;
    options: any;
};
export function addComment(str: any, indent: any, comment: any): any;
export function stringifyComment(comment: any, indent: any): any;
export function stringifyPair({ key, value }: {
    key: any;
    value: any;
}, ctx: any, onComment: any, onChompKeep: any): any;
export function debug(logLevel: any, ...messages: any[]): void;
export function warn(logLevel: any, warning: any): void;
export function addPairToJSMap(ctx: any, map: any, { key, value }: {
    key: any;
    value: any;
}): any;
export function createPair(key: any, value: any, ctx: any): {
    key: any;
    value: any;
    toJSON(_: any, ctx: any): any;
    toString(ctx: any, onComment: any, onChompKeep: any): any;
};
export function stringifyCollection({ comment, flow, items }: {
    comment: any;
    flow: any;
    items: any;
}, ctx: any, { blockItem, flowChars, itemIndent, onChompKeep, onComment }: {
    blockItem: any;
    flowChars: any;
    itemIndent: any;
    onChompKeep: any;
    onComment: any;
}): any;
export function findPair(items: any, key: any): any;
export namespace map {
    export const collection: string;
    export { createMap as createNode };
    const _default: boolean;
    export { _default as default };
    export const nodeClass: any;
    export const tag: string;
    export function resolve(map2: any, onError: any): any;
    export function resolve(map2: any, onError: any): any;
}
export namespace seq {
    const collection_1: string;
    export { collection_1 as collection };
    export { createSeq as createNode };
    const _default_1: boolean;
    export { _default_1 as default };
    const nodeClass_1: any;
    export { nodeClass_1 as nodeClass };
    const tag_1: string;
    export { tag_1 as tag };
    export function resolve(seq2: any, onError: any): any;
    export function resolve(seq2: any, onError: any): any;
}
export namespace string {
    export function identify(value: any): boolean;
    const _default_2: boolean;
    export { _default_2 as default };
    const tag_2: string;
    export { tag_2 as tag };
    export function resolve(str: any): any;
    export function stringify(item: any, ctx: any, onComment: any, onChompKeep: any): any;
    export function stringify(item: any, ctx: any, onComment: any, onChompKeep: any): any;
}
export namespace nullTag {
    export function identify_1(value: any): boolean;
    export { identify_1 as identify };
    export function createNode(): any;
    const _default_3: boolean;
    export { _default_3 as default };
    const tag_3: string;
    export { tag_3 as tag };
    export const test: RegExp;
    export function resolve_1(): any;
    export { resolve_1 as resolve };
    export function stringify({ source }: {
        source: any;
    }, ctx: any): any;
}
export namespace boolTag {
    export function identify_2(value: any): boolean;
    export { identify_2 as identify };
    const _default_4: boolean;
    export { _default_4 as default };
    const tag_4: string;
    export { tag_4 as tag };
    const test_1: RegExp;
    export { test_1 as test };
    export function resolve_2(str: any): any;
    export { resolve_2 as resolve };
    export function stringify({ source, value }: {
        source: any;
        value: any;
    }, ctx: any): any;
    export function stringify({ source, value }: {
        source: any;
        value: any;
    }, ctx: any): any;
}
export function stringifyNumber({ format, minFractionDigits, tag, value }: {
    format: any;
    minFractionDigits: any;
    tag: any;
    value: any;
}): string;
export namespace float {
    export function identify_3(value: any): boolean;
    export { identify_3 as identify };
    const _default_5: boolean;
    export { _default_5 as default };
    const tag_5: string;
    export { tag_5 as tag };
    const test_2: RegExp;
    export { test_2 as test };
    export function resolve(str: any): any;
    export function resolve(str: any): any;
    const stringify_1: any;
    export { stringify_1 as stringify };
}
export namespace floatExp {
    export function identify_4(value: any): boolean;
    export { identify_4 as identify };
    const _default_6: boolean;
    export { _default_6 as default };
    const tag_6: string;
    export { tag_6 as tag };
    export const format: string;
    const test_3: RegExp;
    export { test_3 as test };
    export function resolve_3(str: any): number;
    export { resolve_3 as resolve };
    export function stringify_2({ value }: {
        value: any;
    }): string;
    export { stringify_2 as stringify };
}
export namespace floatNaN {
    export function identify_5(value: any): boolean;
    export { identify_5 as identify };
    const _default_7: boolean;
    export { _default_7 as default };
    const tag_7: string;
    export { tag_7 as tag };
    const test_4: RegExp;
    export { test_4 as test };
    export function resolve_4(str: any): number;
    export { resolve_4 as resolve };
    const stringify_3: any;
    export { stringify_3 as stringify };
}
export namespace int {
    export { intIdentify as identify };
    const _default_8: boolean;
    export { _default_8 as default };
    const tag_8: string;
    export { tag_8 as tag };
    const test_5: RegExp;
    export { test_5 as test };
    export function resolve_5(str: any, _onError: any, opt: any): number | bigint;
    export { resolve_5 as resolve };
    const stringify_4: any;
    export { stringify_4 as stringify };
}
export namespace intHex {
    export { intIdentify as identify };
    const _default_9: boolean;
    export { _default_9 as default };
    const tag_9: string;
    export { tag_9 as tag };
    const format_1: string;
    export { format_1 as format };
    const test_6: RegExp;
    export { test_6 as test };
    export function resolve_6(str: any, _onError: any, opt: any): number | bigint;
    export { resolve_6 as resolve };
    export function stringify_5(node: any): any;
    export { stringify_5 as stringify };
}
export namespace intOct {
    export { intIdentify as identify };
    const _default_10: boolean;
    export { _default_10 as default };
    const tag_10: string;
    export { tag_10 as tag };
    const format_2: string;
    export { format_2 as format };
    const test_7: RegExp;
    export { test_7 as test };
    export function resolve_7(str: any, _onError: any, opt: any): number | bigint;
    export { resolve_7 as resolve };
    export function stringify_6(node: any): any;
    export { stringify_6 as stringify };
}
export var schema: any[];
export namespace binary {
    export function identify_6(value: any): boolean;
    export { identify_6 as identify };
    const _default_11: boolean;
    export { _default_11 as default };
    const tag_11: string;
    export { tag_11 as tag };
    export function resolve(src: any, onError: any): any;
    export function resolve(src: any, onError: any): any;
    export function stringify({ comment, type, value }: {
        comment: any;
        type: any;
        value: any;
    }, ctx: any, onComment: any, onChompKeep: any): any;
    export function stringify({ comment, type, value }: {
        comment: any;
        type: any;
        value: any;
    }, ctx: any, onComment: any, onChompKeep: any): any;
}
export function createPairs(schema: any, iterable: any, ctx: any): any;
export namespace pairs {
    const collection_2: string;
    export { collection_2 as collection };
    const _default_12: boolean;
    export { _default_12 as default };
    const tag_12: string;
    export { tag_12 as tag };
    export { resolvePairs as resolve };
    export { createPairs as createNode };
}
export function resolvePairs(seq: any, onError: any): any;
export var YAMLOMap: any;
export namespace omap {
    const collection_3: string;
    export { collection_3 as collection };
    export function identify_7(value: any): boolean;
    export { identify_7 as identify };
    export { YAMLOMap as nodeClass };
    const _default_13: boolean;
    export { _default_13 as default };
    const tag_13: string;
    export { tag_13 as tag };
    export function resolve(seq: any, onError: any): any;
    export function resolve(seq: any, onError: any): any;
    export function createNode(schema: any, iterable: any, ctx: any): any;
    export function createNode(schema: any, iterable: any, ctx: any): any;
}
export namespace falseTag {
    export function identify_8(value: any): boolean;
    export { identify_8 as identify };
    const _default_14: boolean;
    export { _default_14 as default };
    const tag_14: string;
    export { tag_14 as tag };
    const test_8: RegExp;
    export { test_8 as test };
    export function resolve_8(): any;
    export { resolve_8 as resolve };
    export { boolStringify as stringify };
}
export namespace trueTag {
    export function identify_9(value: any): boolean;
    export { identify_9 as identify };
    const _default_15: boolean;
    export { _default_15 as default };
    const tag_15: string;
    export { tag_15 as tag };
    const test_9: RegExp;
    export { test_9 as test };
    export function resolve_9(): any;
    export { resolve_9 as resolve };
    export { boolStringify as stringify };
}
export namespace intBin {
    export { intIdentify as identify };
    const _default_16: boolean;
    export { _default_16 as default };
    const tag_16: string;
    export { tag_16 as tag };
    const format_3: string;
    export { format_3 as format };
    const test_10: RegExp;
    export { test_10 as test };
    export function resolve_10(str: any, _onError: any, opt: any): number | bigint;
    export { resolve_10 as resolve };
    export function stringify_7(node: any): any;
    export { stringify_7 as stringify };
}
export var YAMLSet: any;
export namespace set {
    const collection_4: string;
    export { collection_4 as collection };
    export function identify_10(value: any): boolean;
    export { identify_10 as identify };
    export { YAMLSet as nodeClass };
    const _default_17: boolean;
    export { _default_17 as default };
    const tag_17: string;
    export { tag_17 as tag };
    export function resolve(map: any, onError: any): any;
    export function resolve(map: any, onError: any): any;
    export function createNode(schema: any, iterable: any, ctx: any): any;
    export function createNode(schema: any, iterable: any, ctx: any): any;
}
export namespace floatTime {
    export function identify_11(value: any): boolean;
    export { identify_11 as identify };
    const _default_18: boolean;
    export { _default_18 as default };
    const tag_18: string;
    export { tag_18 as tag };
    const format_4: string;
    export { format_4 as format };
    const test_11: RegExp;
    export { test_11 as test };
    export function resolve_11(str: any): any;
    export { resolve_11 as resolve };
    export { stringifySexagesimal as stringify };
}
export namespace intTime {
    export function identify_12(value: any): boolean;
    export { identify_12 as identify };
    const _default_19: boolean;
    export { _default_19 as default };
    const tag_19: string;
    export { tag_19 as tag };
    const format_5: string;
    export { format_5 as format };
    const test_12: RegExp;
    export { test_12 as test };
    export function resolve_12(str: any, _onError: any, { intAsBigInt }: {
        intAsBigInt: any;
    }): any;
    export { resolve_12 as resolve };
    export { stringifySexagesimal as stringify };
}
export namespace timestamp {
    export function identify_13(value: any): boolean;
    export { identify_13 as identify };
    const _default_20: boolean;
    export { _default_20 as default };
    const tag_20: string;
    export { tag_20 as tag };
    const test_13: RegExp;
    export { test_13 as test };
    export function resolve(str: any): Date;
    export function resolve(str: any): Date;
    export function stringify_8({ value }: {
        value: any;
    }): any;
    export { stringify_8 as stringify };
}
export var coreKnownTags: {
    "tag:yaml.org,2002:binary": any;
    "tag:yaml.org,2002:omap": any;
    "tag:yaml.org,2002:pairs": any;
    "tag:yaml.org,2002:set": any;
    "tag:yaml.org,2002:timestamp": any;
};
export function getTags(customTags: any, schemaName: any): any;
export function stringifyDocument(doc: any, options: any): string;
export function applyReviver(reviver: any, obj: any, key: any, val: any): any;
export function prettifyError(src: any, lc: any): (error: any) => void;
export function resolveProps(tokens: any, { flow, indicator, next, offset, onError, startOnNewline }: {
    flow: any;
    indicator: any;
    next: any;
    offset: any;
    onError: any;
    startOnNewline: any;
}): {
    comma: any;
    found: any;
    spaceBefore: boolean;
    comment: string;
    hasNewline: boolean;
    anchor: any;
    tag: any;
    end: any;
    start: any;
};
export function containsNewline(key: any): boolean | null;
export function mapIncludes(ctx: any, items: any, search: any): any;
export function resolveBlockMap({ composeNode, composeEmptyNode }: {
    composeNode: any;
    composeEmptyNode: any;
}, ctx: any, bm: any, onError: any): any;
export function resolveBlockSeq({ composeNode, composeEmptyNode }: {
    composeNode: any;
    composeEmptyNode: any;
}, ctx: any, bs: any, onError: any): any;
export function resolveEnd(end: any, offset: any, reqSpace: any, onError: any): {
    comment: string;
    offset: any;
};
export function resolveFlowCollection({ composeNode, composeEmptyNode }: {
    composeNode: any;
    composeEmptyNode: any;
}, ctx: any, fc: any, onError: any): any;
export function composeCollection(CN: any, ctx: any, token: any, tagToken: any, onError: any): any;
export function resolveBlockScalar(scalar: any, strict: any, onError: any): {
    value: string;
    type: any;
    comment: string;
    range: any[];
};
export function resolveFlowScalar(scalar: any, strict: any, onError: any): {
    value: any;
    type: any;
    comment: any;
    range: any[];
};
export function composeScalar(ctx: any, token: any, tagToken: any, onError: any): any;
export function emptyScalarPosition(offset: any, before: any, pos: any): any;
export function composeEmptyNode(ctx: any, offset: any, before: any, pos: any, { spaceBefore, comment, anchor, tag }: {
    spaceBefore: any;
    comment: any;
    anchor: any;
    tag: any;
}, onError: any): any;
export function composeNode(ctx: any, token: any, props: any, onError: any): any;
export function composeDoc(options: any, directives: any, { offset, start, value, end }: {
    offset: any;
    start: any;
    value: any;
    end: any;
}, onError: any): any;
export var BOM: string;
export var DOCUMENT: string;
export var FLOW_END: string;
export function prettyToken(token: any): string;
export function tokenType(source: any): "alias" | "scalar" | "space" | "newline" | "comma" | "doc-start" | "comment" | "anchor" | "tag" | "double-quoted-scalar" | "single-quoted-scalar" | "explicit-key-ind" | "map-value-ind" | "seq-item-ind" | "block-scalar-header" | "byte-order-mark" | "doc-mode" | "flow-error-end" | "doc-end" | "flow-map-start" | "flow-map-end" | "flow-seq-start" | "flow-seq-end" | "directive-line" | null;
declare var cst: any;
export function handler(event: any, context: any): Promise<any>;
declare function createMap(schema: any, obj: any, ctx: any): any;
declare function createSeq(schema: any, obj: any, ctx: any): any;
declare function intIdentify(value: any): boolean;
declare function boolStringify({ value, source }: {
    value: any;
    source: any;
}, ctx: any): any;
declare function stringifySexagesimal(node: any): any;
export { isNum3 as isNum, isStr2 as isStr, isFnc2 as isFnc, cst as CST };
