import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import y from 'yaml'
import * as is from './utils/is'
import * as p from './utils/parse'

export interface CreateParserOptions {
  //
}

function createParser(options: CreateParserOptions = {}) {
  return function parse(value: unknown) {
    if (y.isMap(value)) {
      const keyCount = value.items.length

      if (keyCount === 1) {
        //
      } else if (keyCount > 1) {
        //
      }
    }
  }
}

export default createParser
