import chalk from 'chalk';
import { sync as globbySync } from 'globby';
import * as fs from 'fs-extra';
import { parseDocument as parseYmlToDoc } from 'yaml';
import normalizePath from './normalizePath.js';
export const captioning = (...s) => chalk.hex('#40E09F')(...s);
export const highlight = (...s) => chalk.yellow(...s);
export const italic = (...s) => chalk.italic(chalk.white(...s));
export const aquamarine = (...s) => chalk.keyword('aquamarine')(...s);
export const lightGold = (...s) => chalk.keyword('blanchedalmond')(...s);
export const blue = (...s) => chalk.keyword('deepskyblue')(...s);
export const fadedBlue = (...s) => chalk.blue(...s);
export const cyan = (...s) => chalk.cyan(...s);
export const brightGreen = (...s) => chalk.keyword('chartreuse')(...s);
export const lightGreen = (...s) => chalk.keyword('lightgreen')(...s);
export const green = (...s) => chalk.green(...s);
export const coolGold = (...s) => chalk.keyword('navajowhite')(...s);
export const gray = (...s) => chalk.keyword('lightslategray')(...s);
export const hotpink = (...s) => chalk.hex('#F65CA1')(...s);
export const fadedSalmon = (...s) => chalk.keyword('darksalmon')(...s);
export const magenta = (...s) => chalk.magenta(...s);
export const orange = (...s) => chalk.keyword('lightsalmon')(...s);
export const deepOrange = (...s) => chalk.hex('#FF8B3F')(...s);
export const lightRed = (...s) => chalk.keyword('lightpink')(...s);
export const coolRed = (...s) => chalk.keyword('lightcoral')(...s);
export const red = (...s) => chalk.keyword('tomato')(...s);
export const teal = (...s) => chalk.keyword('turquoise')(...s);
export const white = (...s) => chalk.whiteBright(...s);
export const yellow = (...s) => chalk.yellow(...s);
export const newline = () => console.log('');
export function loadFileAsDoc(filepath) {
    return parseYmlToDoc(fs.readFileSync(filepath, 'utf8'));
}
export function loadFilesAsDocs({ as = 'doc', dir, includeExt = true, recursive = true, }) {
    const xform = as === 'metadataDocs'
        ? (obj) => ({
            doc: loadFileAsDoc(normalizePath(obj.path)),
            name: includeExt
                ? obj.name
                : obj.name.includes('.')
                    ? obj.name.substring(0, obj.name.lastIndexOf('.'))
                    : obj.name,
        })
        : (fpath) => loadFileAsDoc(fpath);
    return globbySync(normalizePath(dir, recursive ? '**/*.yml' : '*.yml'), {
        stats: as === 'metadataDocs',
        onlyFiles: true,
    }).map((fpath) => xform(fpath));
}
export function withSuffix(suffix) {
    return function (str) {
        return str.endsWith(suffix) ? str : `${str}${suffix}`;
    };
}
//# sourceMappingURL=noodl-common.js.map