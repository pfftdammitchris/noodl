import axios from 'axios'
import path from 'path'

export default async function fetchAssetMetadata(url = '') {
  try {
    const resp = await axios.get(url)
    const parsedUrl = path.parse(url)
    return {
      filename: parsedUrl.base,
      name: parsedUrl.name,
      ext: parsedUrl.ext,
      lastModified: new Date(resp.headers['last-modified']).getTime(),
      mimeType: resp.headers['content-type'],
      server: resp.headers.server,
      size: Number(resp.headers['content-length']),
      url: resp.config.url,
    }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}
