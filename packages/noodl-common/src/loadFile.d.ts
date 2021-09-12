import type { LiteralUnion } from 'type-fest';
import { Document } from 'yaml';
/**
 * Loads a file at filepath relative to the current file
 * @param { string } filepath - File path of file to be loaded
 */
declare function loadFile<T extends 'yml'>(filepath: string, type?: LiteralUnion<T, string>): string;
declare function loadFile<T extends 'doc'>(filepath: string, type: LiteralUnion<T, string>): Document;
declare function loadFile<T extends 'json'>(filepath: string, type: LiteralUnion<T, string>): Record<string, any>;
export default loadFile;
