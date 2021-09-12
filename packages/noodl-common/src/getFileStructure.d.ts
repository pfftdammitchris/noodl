import { FileStructure } from './types.js';
/**
 * @param { string } filepath
 * @param { object } opts
 * @param { string } [opts.config]
 * @returns { FileStructure }
 */
declare function getFileStructure(filepath: string, opts?: {
    config?: string;
}): FileStructure;
export default getFileStructure;
