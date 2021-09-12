/**
 * Returns the base name of the file path. A base name contains the file name
 * including its ext
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
declare function getBasename(str?: string | undefined, ext?: string): string;
export default getBasename;
