import axios from 'axios'
import y from 'yaml'

/**
 * Fetches a yaml file using the url provided.
 * If "as" is "json", the result will be parsed and returned as json
 *
 * @param url URL
 * @param as Return data as json or yml. Defaults to 'yml'
 * @returns { string | Record<string, any> }
 */
async function fetchYml(url = '', as: 'json' | 'yml' = 'yml') {
  try {
    const isJson = as === 'json'
    const contentType = isJson ? 'application/json' : 'text/plain'
    const { data: yml } = await axios.get(url, {
      headers: {
        Accept: contentType,
        'Content-Type': contentType,
      },
    })
    return isJson ? y.parse(yml) : y.parse(yml)
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    throw err
  }
}

export default fetchYml
