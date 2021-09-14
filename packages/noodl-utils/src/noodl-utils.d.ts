import { ReferenceString, ReferenceSymbol, IfObject } from 'noodl-types';
import * as t from './types';
export declare function createPlaceholderReplacer(placeholders: string | string[], flags?: string): {
    (str: string, value: string | number): string;
    <Obj extends {} = any>(obj: Obj, value: string | number): Obj;
};
export declare const createNoodlPlaceholderReplacer: (keyMap: {
    cadlBaseUrl?: any;
    cadlVersion?: any;
    designSuffix?: any;
}) => (...args: any[]) => any;
/**
 * Transforms the dataKey of an emit object. If the dataKey is an object,
 * the values of each property will be replaced by the data value based on
 * the path described in its value. The 2nd arg should be a data object or
 * an array of data objects that will be queried against. Data keys must
 * be stripped of their iteratorVar prior to this call
 * @param { string | object } dataKey - Data key of an emit object
 * @param { object | object[] } dataObject - Data object or an array of data objects
 */
export declare function createEmitDataKey(dataKey: string | Record<string, any>, dataObject: t.QueryObj | t.QueryObj[], opts?: {
    iteratorVar?: string;
}): any;
export declare function excludeIteratorVar(dataKey: string | undefined, iteratorVar?: string | undefined): string | undefined;
/**
 * Takes a callback and an "if" object. The callback will receive the three
 * values that the "if" object contains. The first item will be the value that
 * should be evaluated, and the additional (item 2 and 3) arguments will be the values
 * deciding to be returned. If the callback returns true, item 2 is returned. If
 * false, item 3 is returned
 * @param { function } fn - Callback that receives the value being evaluated
 * @param { IfObject } ifObj - The object that contains the "if"
 */
export declare function evalIf<IfObj extends IfObject>(fn: (val: IfObj['if'][0], onTrue: IfObj['if'][1], onFalse: IfObj['if'][2]) => boolean, ifObj: IfObj): IfObj['if'][1] | IfObj['if'][2] | Promise<IfObj['if'][1] | IfObj['if'][2]>;
declare type FindDataValueItem = ((...args: any[]) => any) | Record<string, any> | FindDataValueItem[];
/**
 * Runs through objs and returns the value at path if a dataObject is received
 * @param { function | object | array } objs - Data objects to iterate over
 * @param { string | string[] } path
 */
export declare const findDataValue: <O extends FindDataValueItem = any>(objs: O, path: string | string[] | undefined) => any;
export declare function findReferences(obj: any): string[];
export declare function getDataValue<T = any>(dataObject: T | undefined, dataKey: string | undefined, opts?: {
    iteratorVar?: string;
}): any;
export declare const hasNoodlPlaceholder: (str: string | undefined) => boolean;
export declare function isOutboundLink(s?: string | undefined): boolean;
export declare function isRootDataKey(dataKey: string | undefined): boolean;
export declare function isSerializableStr(value: unknown): boolean;
export declare function isStable(): boolean;
export declare function isTest(): boolean;
export declare function isValidAsset(value: string | undefined): boolean;
/**
 * Trims the reference prefix in the string
 * @param v Reference string
 * @param fixType 'prefix'
 */
export declare function trimReference(v: ReferenceString, fixType: 'prefix'): ReferenceString<Exclude<ReferenceSymbol, '@'>>;
/**
 * Trims the reference suffix in the string
 * @param v Reference string
 * @param fixType 'suffix'
 */
export declare function trimReference(v: ReferenceString, fixType: 'suffix'): ReferenceString<Extract<ReferenceSymbol, '@'>>;
/**
 * Trims the both prefix and the suffix symbol(s) in the reference string
 * @param v Reference string
 * @return { string }
 */
export declare function trimReference(v: ReferenceString): string;
export declare function withYmlExt(str?: string): string;
export {};
