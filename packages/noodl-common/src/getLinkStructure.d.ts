import { LinkStructure } from './types.js';
/**
 * @param { string } link
 * @param { object } opts
 * @returns { LinkStructure }
 */
declare function getLinkStructure(link: string, opts?: {
    config?: string;
    prefix?: string;
}): LinkStructure;
export default getLinkStructure;
