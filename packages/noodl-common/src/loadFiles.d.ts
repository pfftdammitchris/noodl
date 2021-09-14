import { Document as YAMLDocument } from 'yaml';
import * as t from './types.js';
/**
 * Load files from dir and optionally provide a second argument as an options
 * object
 *
 * Supported options:
 *
 * - as: "list" to receive the result as an array, "map" as a Map, and "object"
 * 		as an object. Defaults to "list"
 * - onFile: A callback function to call when a filepath is being inserted to
 * 		the result
 * - type: Return each data in the from of "doc", "json", or "yml" (Defaults to
 * 		"yml")
 */
/**
 * Load files into an array of strings as raw yml
 */
declare function loadFiles<T extends 'yml', A extends 'list'>(dir: string, opts?: t.LoadFilesOptions<T, A>): string[];
/**
 * Load files into an array of objects
 */
declare function loadFiles<T extends 'json', A extends 'list'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Record<string, any>[];
/**
 * Load files into an array of yaml documents
 */
declare function loadFiles<T extends 'doc', A extends 'list'>(dir: string, opts?: t.LoadFilesOptions<T, A>): YAMLDocument[];
/**
 * Load files into an object literal where key is the name and the value is
 * their yml
 */
declare function loadFiles<T extends 'yml', A extends 'object'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Record<string, string>;
/**
 * Load files into an object literal where key is the name and the value is a
 * JS object
 */
declare function loadFiles<T extends 'json', A extends 'object'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Record<string, any>;
/**
 * Load files into an object literal where key is the name and the value is a
 * yaml node
 */
declare function loadFiles<T extends 'doc', A extends 'object'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Record<string, YAMLDocument>;
/**
 * Load files into a Map where key is the name and value is their yml
 */
declare function loadFiles<T extends 'yml', A extends 'map'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Map<string, string>;
/**
 * Load files into a Map where key is the name and value is a JS object
 */
declare function loadFiles<T extends 'json', A extends 'map'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Map<string, any>;
/**
 * Load files into a Map where key is the name and value is a yaml node
 */
declare function loadFiles<T extends 'doc', A extends 'map'>(dir: string, opts?: t.LoadFilesOptions<T, A>): Map<string, YAMLDocument>;
/**
 * Load files from dir and optionally a second argument as 'yml' (default) for an array of yml data
 */
declare function loadFiles<T extends 'yml'>(dir: string, type?: undefined | T): string[];
/**
 * Load files from dir and optionally a second argument as 'json' to receive
 * an array of objects
 */
declare function loadFiles<T extends 'json'>(dir: string, type: T): Record<string, any>[];
/**
 * Load files from dir and optionally a second argument as 'doc' to receive
 * an array of yaml nodes
 */
declare function loadFiles<T extends 'doc'>(dir: string, type: T): YAMLDocument[];
export default loadFiles;
