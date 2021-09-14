import yaml from 'yaml';
export function extractPreloadPages(doc) {
    if (yaml.isDocument(doc)) {
        return (doc.get('preload')?.toJSON?.() || []);
    }
    else {
        return doc?.preload || [];
    }
}
export function extractPages(doc) {
    if (yaml.isDocument(doc)) {
        return (doc.get('page')?.toJSON?.() || []);
    }
    else {
        return doc?.page || [];
    }
}
/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export async function promiseAllSafe(...promises) {
    const results = [];
    for (const promise of promises) {
        try {
            const result = await promise;
            results.push(result);
        }
        catch (error) {
            results.push(error);
        }
    }
    return results;
}
//# sourceMappingURL=utils.js.map