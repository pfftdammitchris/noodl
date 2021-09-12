/**
 * Normalizes the path (compatible with win). Useful for globs to work
 * expectedly
 * @param s
 * @returns { string }
 */
declare function normalizePath(...s: string[]): string;
export default normalizePath;
