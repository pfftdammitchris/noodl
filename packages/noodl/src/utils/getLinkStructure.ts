import * as path from 'path'
import { LinkStructure } from '../types'

/**
 * @param { string } link
 * @param { object } opts
 * @returns { LinkStructure }
 */
function getLinkStructure(
  link: string,
  opts?: { config?: string; prefix?: string },
) {
  const parsed = path.parse(link)
  const structure = {
    raw: link,
    ext: parsed.ext,
    filename: parsed.name,
    isRemote: /^(http|www)/i.test(link),
    url: link.startsWith('http')
      ? link
      : opts?.prefix
      ? `${opts.prefix}${opts.prefix.endsWith('/') ? link : `/${link}`}`
      : link,
  } as LinkStructure

  if (opts?.config === structure.filename) {
    structure.group = 'config'
  } else if (structure.ext.endsWith('.yml')) {
    structure.group = 'page'
  } else if (/.*(bmp|gif|jpg|jpeg|png|tif)$/i.test(structure.ext)) {
    structure.group = 'image'
  } else if (/.*(doc|docx|json|pdf)$/i.test(structure.ext)) {
    structure.group = 'document'
  } else if (/.*(avi|mp4|mkv|wmv)$/i.test(structure.ext)) {
    structure.group = 'video'
  } else if (/.*(html)$/i.test(structure.ext)) {
    structure.group = 'script'
  } else {
    structure.group = 'unknown'
  }

  return structure
}

export default getLinkStructure
