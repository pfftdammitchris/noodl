import { stringify } from 'yaml';
/**
 * Returns the stringified output of the yaml document. If there are errors, it
 * returns a stringified yaml output of the errors instead
 * @param { Document } doc
 */
function stringifyDoc(doc, opts) {
    let result = '';
    if (doc) {
        if (doc.errors.length) {
            result = stringify(doc.errors);
        }
        else {
            result = doc.toString({ singleQuote: true, ...opts });
        }
    }
    return result;
}
export default stringifyDoc;
//# sourceMappingURL=stringifyDoc.js.map