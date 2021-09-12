"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTag = exports.withoutExt = exports.withEngLocale = exports.withYmlExt = exports.withSuffix = exports.writeFileSync = exports.sortObjPropsByKeys = exports.readdirSync = exports.promiseAllSafe = exports.loadFilesAsDocs = exports.loadFileAsDoc = exports.hasSlash = exports.hasDot = exports.getFilename = exports.getPathname = exports.getExt = exports.ensureSuffix = exports.ensureSlashPrefix = exports.newline = exports.yellow = exports.white = exports.teal = exports.red = exports.coolRed = exports.lightRed = exports.deepOrange = exports.orange = exports.magenta = exports.fadedSalmon = exports.hotpink = exports.gray = exports.coolGold = exports.green = exports.lightGreen = exports.brightGreen = exports.cyan = exports.fadedBlue = exports.blue = exports.lightGold = exports.aquamarine = exports.italic = exports.highlight = exports.captioning = void 0;
const u = require("@jsmanifest/utils");
const chalk_1 = require("chalk");
const globby_1 = require("globby");
const path_1 = require("path");
const fs = require("fs-extra");
const yaml_1 = require("yaml");
const minimatch_1 = require("minimatch");
const normalizePath_js_1 = require("./normalizePath.js");
// const {
// 	readdirSync: _readdirSync,
// 	readFileSync,
// 	statSync,
// 	writeFileSync: _writeFileSync,
// } = fs
const captioning = (...s) => chalk_1.default.hex('#40E09F')(...s);
exports.captioning = captioning;
const highlight = (...s) => chalk_1.default.yellow(...s);
exports.highlight = highlight;
const italic = (...s) => chalk_1.default.italic(chalk_1.default.white(...s));
exports.italic = italic;
const aquamarine = (...s) => chalk_1.default.keyword('aquamarine')(...s);
exports.aquamarine = aquamarine;
const lightGold = (...s) => chalk_1.default.keyword('blanchedalmond')(...s);
exports.lightGold = lightGold;
const blue = (...s) => chalk_1.default.keyword('deepskyblue')(...s);
exports.blue = blue;
const fadedBlue = (...s) => chalk_1.default.blue(...s);
exports.fadedBlue = fadedBlue;
const cyan = (...s) => chalk_1.default.cyan(...s);
exports.cyan = cyan;
const brightGreen = (...s) => chalk_1.default.keyword('chartreuse')(...s);
exports.brightGreen = brightGreen;
const lightGreen = (...s) => chalk_1.default.keyword('lightgreen')(...s);
exports.lightGreen = lightGreen;
const green = (...s) => chalk_1.default.green(...s);
exports.green = green;
const coolGold = (...s) => chalk_1.default.keyword('navajowhite')(...s);
exports.coolGold = coolGold;
const gray = (...s) => chalk_1.default.keyword('lightslategray')(...s);
exports.gray = gray;
const hotpink = (...s) => chalk_1.default.hex('#F65CA1')(...s);
exports.hotpink = hotpink;
const fadedSalmon = (...s) => chalk_1.default.keyword('darksalmon')(...s);
exports.fadedSalmon = fadedSalmon;
const magenta = (...s) => chalk_1.default.magenta(...s);
exports.magenta = magenta;
const orange = (...s) => chalk_1.default.keyword('lightsalmon')(...s);
exports.orange = orange;
const deepOrange = (...s) => chalk_1.default.hex('#FF8B3F')(...s);
exports.deepOrange = deepOrange;
const lightRed = (...s) => chalk_1.default.keyword('lightpink')(...s);
exports.lightRed = lightRed;
const coolRed = (...s) => chalk_1.default.keyword('lightcoral')(...s);
exports.coolRed = coolRed;
const red = (...s) => chalk_1.default.keyword('tomato')(...s);
exports.red = red;
const teal = (...s) => chalk_1.default.keyword('turquoise')(...s);
exports.teal = teal;
const white = (...s) => chalk_1.default.whiteBright(...s);
exports.white = white;
const yellow = (...s) => chalk_1.default.yellow(...s);
exports.yellow = yellow;
const newline = () => console.log('');
exports.newline = newline;
function ensureSlashPrefix(s) {
    if (!s.startsWith('/'))
        s = `/${s}`;
    return s;
}
exports.ensureSlashPrefix = ensureSlashPrefix;
function ensureSuffix(value, s) {
    if (!value.endsWith(s))
        value = `${value}${s}`;
    return value;
}
exports.ensureSuffix = ensureSuffix;
function getExt(str) {
    return hasDot(str) ? str.substring(str.lastIndexOf('.') + 1) : '';
}
exports.getExt = getExt;
function getPathname(str) {
    return hasSlash(str) ? str.substring(str.lastIndexOf('/') + 1) : '';
}
exports.getPathname = getPathname;
function getFilename(str) {
    if (!hasSlash(str))
        return str;
    return str.substring(str.lastIndexOf('/') + 1);
}
exports.getFilename = getFilename;
function hasDot(s) {
    return !!s?.includes('.');
}
exports.hasDot = hasDot;
function hasSlash(s) {
    return !!s?.includes('/');
}
exports.hasSlash = hasSlash;
function loadFileAsDoc(filepath) {
    return yaml_1.parseDocument(fs.readFileSync(filepath, 'utf8'));
}
exports.loadFileAsDoc = loadFileAsDoc;
function loadFilesAsDocs({ as = 'doc', dir, includeExt = true, recursive = true, }) {
    const xform = as === 'metadataDocs'
        ? (obj) => ({
            doc: loadFileAsDoc(normalizePath_js_1.default(obj.path)),
            name: includeExt
                ? obj.name
                : obj.name.includes('.')
                    ? obj.name.substring(0, obj.name.lastIndexOf('.'))
                    : obj.name,
        })
        : (fpath) => loadFileAsDoc(fpath);
    return globby_1.sync(normalizePath_js_1.default(dir, recursive ? '**/*.yml' : '*.yml'), {
        stats: as === 'metadataDocs',
        onlyFiles: true,
    }).map((fpath) => xform(fpath));
}
exports.loadFilesAsDocs = loadFilesAsDocs;
/**
 * Resolves an array of promises safely, inserting each result to the list
 * including errors that occurred inbetween.
 * @param { Promise[] } promises - Array of promises
 */
async function promiseAllSafe(...promises) {
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
exports.promiseAllSafe = promiseAllSafe;
function readdirSync(dir = __dirname, opts) {
    const args = { encoding: 'utf8' };
    const files = [];
    const filepaths = fs.readdirSync(dir, args);
    const glob = opts?.glob || '**/*';
    for (let filepath of filepaths) {
        filepath = normalizePath_js_1.default(path_1.resolve(path_1.join(dir, filepath)));
        const stat = fs.statSync(filepath);
        if (stat.isFile()) {
            if (minimatch_1.default(filepath, glob))
                files.push(filepath);
        }
        else if (stat.isDirectory()) {
            files.push(...readdirSync(filepath, opts));
        }
    }
    return files;
}
exports.readdirSync = readdirSync;
function sortObjPropsByKeys(obj) {
    return u
        .entries(obj)
        .sort((a, b) => {
        if (a[1] > b[1])
            return -1;
        if (a[1] === b[1])
            return 0;
        return 1;
    })
        .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {});
}
exports.sortObjPropsByKeys = sortObjPropsByKeys;
function writeFileSync(filepath = '', data, options) {
    fs.writeFileSync(normalizePath_js_1.default(filepath), data, u.isStr(options)
        ? { encoding: options }
        : { encoding: 'utf8', ...options });
}
exports.writeFileSync = writeFileSync;
function withSuffix(suffix) {
    return function (str) {
        return str.endsWith(suffix) ? str : `${str}${suffix}`;
    };
}
exports.withSuffix = withSuffix;
exports.withYmlExt = withSuffix('.yml');
exports.withEngLocale = withSuffix('_en');
function withoutExt(str) {
    return hasDot(str) ? str.substring(str.lastIndexOf('.')) : str;
}
exports.withoutExt = withoutExt;
// prettier-ignore
const withTag = (colorFunc = exports.cyan) => (s) => `[${colorFunc(s)}]`;
exports.withTag = withTag;
//# sourceMappingURL=noodl-common.js.map