import type { WriteFileOptions } from 'fs-extra';
import { Document } from 'yaml';
export declare const captioning: (...s: any[]) => string;
export declare const highlight: (...s: any[]) => string;
export declare const italic: (...s: any[]) => string;
export declare const aquamarine: (...s: any[]) => string;
export declare const lightGold: (...s: any[]) => string;
export declare const blue: (...s: any[]) => string;
export declare const fadedBlue: (...s: any[]) => string;
export declare const cyan: (...s: any[]) => string;
export declare const brightGreen: (...s: any[]) => string;
export declare const lightGreen: (...s: any[]) => string;
export declare const green: (...s: any[]) => string;
export declare const coolGold: (...s: any[]) => string;
export declare const gray: (...s: any[]) => string;
export declare const hotpink: (...s: any[]) => string;
export declare const fadedSalmon: (...s: any[]) => string;
export declare const magenta: (...s: any[]) => string;
export declare const orange: (...s: any[]) => string;
export declare const deepOrange: (...s: any[]) => string;
export declare const lightRed: (...s: any[]) => string;
export declare const coolRed: (...s: any[]) => string;
export declare const red: (...s: any[]) => string;
export declare const teal: (...s: any[]) => string;
export declare const white: (...s: any[]) => string;
export declare const yellow: (...s: any[]) => string;
export declare const newline: () => void;
export declare function ensureSlashPrefix(s: string): string;
export declare function ensureSuffix(value: string, s: string): string;
export declare function getExt(str: string): string;
export declare function getPathname(str: string): string;
export declare function getFilename(str: string): string;
export declare function hasDot(s: string): boolean;
export declare function hasSlash(s: string): boolean;
export declare function loadFileAsDoc(filepath: string): Document.Parsed<import("yaml").ParsedNode>;
export declare function loadFilesAsDocs(opts: {
    as: 'doc';
    dir: string;
    includeExt?: boolean;
    recursive: boolean;
}): Document.Parsed[];
export declare function loadFilesAsDocs(opts: {
    as: 'metadataDocs';
    dir: string;
    includeExt?: boolean;
    recursive: boolean;
}): {
    name: string;
    doc: Document.Parsed;
}[];
/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export declare function promiseAllSafe(...promises: Promise<any>[]): Promise<any[]>;
export declare function readdirSync(dir?: string | undefined, opts?: {
    concat?: string[];
    glob?: string;
}): string[];
export declare function sortObjPropsByKeys<O extends Record<string, any>>(obj: {
    [key: string]: any;
}): O & {
    [x: string]: any;
};
export declare function writeFileSync(filepath: string | undefined, data: string, options?: WriteFileOptions): void;
export declare function withSuffix(suffix: string): (str: string) => string;
export declare const withYmlExt: (str: string) => string;
export declare const withEngLocale: (str: string) => string;
export declare function withoutExt(str: string): string;
export declare const withTag: (colorFunc?: (...s: any[]) => string) => (s: string) => string;
