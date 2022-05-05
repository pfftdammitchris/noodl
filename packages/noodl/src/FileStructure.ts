import y from 'yaml'
import { join as joinPath, parse as parsePath } from 'path'
import type { ParsedPath } from 'path'
import * as is from './utils/is'
import * as t from './types'

export interface IFileStructure
  extends t.IStructure<'image' | 'page' | 'script' | 'video' | 'unknown'> {
  ext: string
  dir: string | null
  filepath: string | null
  rootDir: string | null
}

class FileStructure extends t.AStructure<IFileStructure> {
  #transform?: (node: any) => any
  name = 'file'

  constructor(transform?: (node: any) => any) {
    super()
    if (transform) this.#transform = transform
  }

  is(node: t.YAMLNode | unknown) {
    if (this.#transform) node = this.#transform(node)
    if (typeof node === 'string') {
      if (node.startsWith('file:')) return true
      if (is.file(node)) return true
    } else if (y.isScalar(node)) {
      return this.is(node.value)
    }
    return false
  }

  createStructure(node: t.YAMLNode | string, group?: string) {
    const raw = y.isScalar(node) ? node.value : node

    if (this.#transform) node = this.#transform(node)

    const str = y.isScalar(node)
      ? String(node.value)
      : typeof node === 'string'
      ? node
      : String(node)

    const parsed = parsePath(str)
    const basename = parsed.base
    const ext = parsed.ext
      ? parsed.ext.replace(/\./g, '')
      : is.file(basename)
      ? basename.substring(basename.lastIndexOf('.') + 1)
      : null

    return {
      name: parsed.name,
      ext,
      group:
        (group as IFileStructure['group']) || this.getGroup({ ...parsed, ext }),
      raw,
      dir: parsed.dir || null,
      filepath: parsed.dir ? joinPath(parsed.dir, basename) : null,
      rootDir: parsed.root || null,
    }
  }

  getGroup(str: ParsedPath | string) {
    const parsed = typeof str === 'object' ? str : parsePath(str)
    if (parsed.ext === '') {
      return parsed.base === parsed.name ? 'unknown' : 'script'
    }
    if (parsed.base.endsWith('.yml')) return 'page'
    if (is.image(parsed.base)) return 'image'
    if (is.video(parsed.base)) return 'video'
    return 'unknown'
  }
}

export default FileStructure
