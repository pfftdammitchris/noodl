import { Document, ToStringOptions } from 'yaml';
/**
 * Returns the stringified output of the yaml document. If there are errors, it
 * returns a stringified yaml output of the errors instead
 * @param { Document } doc
 */
declare function stringifyDoc(doc: Document | undefined | null, opts?: ToStringOptions): string;
export default stringifyDoc;
