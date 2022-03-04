import * as u from '@jsmanifest/utils'
import {
  basename,
  join as joinPath,
  isAbsolute as isAbsolutePath,
  parse as parsePath,
  resolve as resolvePath,
} from 'path'
import {
  ensureDirSync,
  existsSync,
  readFileSync as originalReadFileSync,
  readJsonSync as originalReadJsonSync,
  writeFileSync as originalWriteFileSync,
  writeJsonSync,
} from 'fs-extra'

/**
 * @param { string } filepath
 * @param { object } [opts]
 * @param { any } [opts.defaultValue]
 * @param { 'json' | 'html' } [opts.type]
 */
export function ensureFile(
  filepath = '',
  { defaultValue = '', type = 'json' } = {},
) {
  ensureDirSync(parsePath(filepath).dir)
  if (!existsSync(filepath)) {
    if (typeof defaultValue === 'string' || defaultValue == null) {
      writeFileSync(filepath, defaultValue, 'utf8')
    } else if (typeof defaultValue === 'object') {
      writeJsonSync(filepath, defaultValue, { spaces: 2 })
    }
  }
  if (type === 'json') {
    const file = readFileSync(filepath)
    if (file === '') writeJsonSync(filepath, {})
    return readJsonSync(filepath)
  }
  return readFileSync(filepath)
}

/**
 * Ensures that the string ends with ext
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
export function ensureExt(str: string, ext: string) {
  if (str && ext) {
    if (!ext.startsWith('.')) ext = `.${ext}`
    if (!str.endsWith(ext)) return `${str}${ext}`
    if (str.endsWith('.')) return `${str}${ext.substring(1)}`
  }
  return str
}

/**
 * Returns the path as an absolute path
 * @param { string[] } paths
 * @returns { string }
 */
export function getAbsFilePath(...paths: string[]) {
  const filepath = normalizePath(...paths)
  if (isAbsolutePath(filepath)) return filepath
  return resolvePath(normalizePath(process.cwd(), ...paths))
}

/**
 * Returns the file name from the file path (including the ext)
 * Supply a 2nd parameter to remove the ext (ex: '.tsx)
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
export function getFileName(str: string | undefined = '', ext?: string) {
  if (!ext) return basename(str)
  return basename(str, ext.startsWith('.') ? ext : `.${ext}`)
}

/**
 * Normalizes the path (compatible with win).
 * Useful for globs to work expectedly
 * @param s String paths
 * @returns { string }
 */
export function normalizePath(...s: string[]) {
  let result = (s.length > 1 ? joinPath(...s) : s[0]).replace(/\\/g, '/')
  if (result.includes('/~/')) result = result.replace('~/', '')
  return result
}

/**
 *  Removes extension from the string if it exists
 * @param { string } str
 * @param { string } ext
 * @returns { string }
 */
export function removeExt(str: string, ext: string) {
  if (str) {
    if (ext.startsWith('.')) {
      if (str.endsWith(ext)) return str.replace(ext, '')
      ext = ext.substring(1)
    }
    if (str.endsWith(`.${ext}`)) return str.replace(`.${ext}`, '')
  }
  return str
}

/**
 * Reads a file from the filesystem
 * @param { string } path
 * @param { string | object } [opts]
 * @returns { string }
 */
export function readFileSync(
  path: string,
  opts?: BufferEncoding | { encoding?: BufferEncoding; flags?: string },
) {
  return originalReadFileSync(path, {
    encoding: (u.isStr(opts) ? opts : opts?.encoding) || 'utf8',
    flag: u.isObj(opts) ? opts.flags : undefined,
  })
}

export function readJsonSync(path: string) {
  return originalReadJsonSync(path)
}

/**
 * Writes a file to the filesystem
 * @param s String paths
 * @returns { string }
 */
export function writeFileSync(
  path: string,
  data: any,
  encoding: BufferEncoding = 'utf8',
) {
  originalWriteFileSync(path, data, encoding)
}
