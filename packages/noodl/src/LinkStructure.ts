import y from 'yaml'
import { isAbsolute as isAbsPath, parse as parsePath } from 'path'
import type { ParsedPath } from 'path'
import * as t from './types'
import * as is from './utils/is'

export interface ILinkStructure
  extends t.IStructure<'image' | 'page' | 'script' | 'video' | 'unknown'> {
  ext: string | null
  isRemote: boolean | null
  url: string | null
}

class LinkStructure extends t.AStructure<ILinkStructure> {
  #transform?: (node: any) => any
  name = 'link'

  constructor(transform?: (node: any) => any) {
    super()
    if (transform) this.#transform = transform
  }

  is(node: any) {
    if (this.#transform) node = this.#transform(node)
    if (typeof node === 'string') {
      return is.url(node)
    } else if (y.isScalar(node)) {
      return this.is(node.value)
    }
    return false
  }

  createStructure(node: any, group?: string) {
    let raw = node

    if (this.#transform) node = this.#transform(node)

    let url = y.isScalar(node)
      ? String(node.value)
      : typeof node === 'string'
      ? node
      : String(node)

    const parsed = parsePath(url || '')
    const basename = parsed.base

    const ext = parsed.ext
      ? parsed.ext.replace(/\./g, '')
      : is.file(basename)
      ? basename.substring(basename.lastIndexOf('.') + 1)
      : null

    console.log({ parsed, ext, raw, isAbsPath: isAbsPath(raw) })

    return {
      ext,
      group: (group as ILinkStructure['group']) || this.getGroup(parsed),
      raw,
      isRemote:
        String(node).startsWith('http') || String(node).startsWith('www'),
      url,
    }
  }

  getGroup(str: ParsedPath | string) {
    const parsed = typeof str === 'object' ? str : parsePath(str)
    if (parsed.ext === '') return 'script'
    if (parsed.base.endsWith('.yml')) return 'page'
    if (is.image(parsed.base)) return 'image'
    if (is.video(parsed.base)) return 'video'
    return 'unknown'
  }
}

export default LinkStructure
