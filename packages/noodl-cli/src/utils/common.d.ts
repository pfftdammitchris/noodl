import type { WriteFileOptions } from 'fs-extra';
export declare function ensureSlashPrefix(s: string): string;
export declare function getCliConfig(): any;
/**
 * Normalizes the path (compatible with win). Useful for globs to work
 * expectedly
 * @param s
 * @returns { string }
 */
export declare function normalizePath(...s: string[]): string;
/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export declare function promiseAllSafe(...promises: Promise<any>[]): Promise<any[]>;
export declare function writeFileSync(filepath: string | undefined, data: string, options?: WriteFileOptions): void;
