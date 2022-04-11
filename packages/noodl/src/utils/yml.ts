import axios from 'axios'
import y from 'yaml'
import type { ToStringOptions } from 'yaml'
import * as t from '../types'

/**
 * Fetches a yaml file using the url provided.
 * If "as" is "json", the result will be parsed and returned as json
 *
 * @param url URL
 * @param as Return data as json or yml. Defaults to 'yml'
 * @returns { string | Record<string, any> }
 */
export async function fetchYml(url = '', as: 'json' | 'yml' = 'yml') {
  try {
    const isJson = as === 'json'
    const contentType = isJson ? 'application/json' : 'text/plain'
    const { data: yml } = await axios.get(url, {
      headers: {
        Accept: contentType,
        'Content-Type': contentType,
      },
    })
    return isJson ? y.parse(yml) : yml
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    throw err
  }
}

export function parse<DataType extends t.Loader.RootDataType>(
  dataType: DataType,
  yml = '',
): DataType extends 'map' ? y.Document.Parsed : Record<string, any> {
  return dataType === 'map' ? y.parseDocument(yml) : y.parse(yml)
}

/**
 * Returns the stringified output of the yaml document or object.
 * If there are errors when parsing yaml documents, it returns a stringified yaml output of the errors instead
 * @param { y.Document } doc
 */
export function stringify<O extends y.Document | Record<string, any>>(
  value: O | undefined | null,
  opts?: ToStringOptions,
) {
  let result = ''

  if (value) {
    if (y.isDocument(value)) {
      if (value.errors.length) {
        result = y.stringify(value.errors)
      } else {
        result = value.toString(opts)
      }
    } else {
      result = y.stringify(value)
    }
  }

  return result
}

export function withYmlExt(s = '') {
  return !s.endsWith('.yml') && (s += '.yml')
}
