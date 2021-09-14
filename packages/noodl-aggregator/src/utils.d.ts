import yaml from 'yaml';
import type { AppConfig } from 'noodl-types';
export declare function extractPreloadPages(doc: yaml.Document | AppConfig | undefined): string[];
export declare function extractPages(doc: yaml.Document | AppConfig | undefined): string[];
/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
export declare function promiseAllSafe(...promises: Promise<any>[]): Promise<any[]>;
