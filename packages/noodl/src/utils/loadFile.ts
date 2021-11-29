import * as u from '@jsmanifest/utils'
import * as fs from 'fs-extra'
import type { LiteralUnion } from 'type-fest'
import { isAbsolute as isAbsolutePath } from 'path'
import type { YAMLDocument } from '../internal/yaml'
import {
  parse as parseYmlToJson,
  parseDocument as parseYmlToDoc,
} from '../internal/yaml'
import { getAbsFilePath } from './fileSystem'
import * as t from '../types'

/**
 * Loads a file as a yaml string
 * @param filepath
 * @param type
 */
function loadFile<T extends 'yml'>(
  filepath: string,
  type?: LiteralUnion<T, string>,
): string

/**
 * Loads a file as a document
 * @link https://eemeli.org/yaml/#documents
 * @param filepath
 * @param type
 */
function loadFile(filepath: string, type: 'doc'): YAMLDocument

/**
 * Loads a file as json
 * @param filepath
 * @param type
 */
function loadFile(filepath: string, type: 'json'): Record<string, any>

function loadFile<T extends t.LoadType = t.LoadType>(
  filepath: string,
  type?: T,
) {
  if (u.isStr(filepath)) {
    if (!isAbsolutePath(filepath)) filepath = getAbsFilePath(filepath)
    if (fs.existsSync(filepath)) {
      const yml = fs.readFileSync(filepath, 'utf8')
      if (type === 'doc') return parseYmlToDoc(yml)
      if (type === 'json') return parseYmlToJson(yml)
      return fs.readFileSync(filepath, 'utf8')
    }
  }
}

export default loadFile
