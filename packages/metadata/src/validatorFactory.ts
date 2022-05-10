import * as u from '@jsmanifest/utils'
import y from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import * as n from 'noodl'
import type { YAMLNode } from 'noodl'

export interface ValidatorResult {
  type: 'error' | 'warn' | 'info' | null
  message?: Error | string | (Error | string)[]
  value: any
  data?: Record<string, any>
  [key: string]: any
}

export abstract class Validator {
  abstract ntype: string
  abstract validate(
    args: { key?: any; value: any } & Record<string, any>,
  ): void | null | undefined | (ValidatorResult & Record<string, any>)
}

export class KeyValidator extends Validator {
  #key: string
  #fn: ((args: { key: string; value: any }) => ValidatorResult) | undefined
  ntype = '__key.validator__'
  options = {} as {
    required?: boolean
  }

  constructor(key: string) {
    super()
    this.#key = key
  }

  validate({ value }) {
    let result: ValidatorResult
    result = this.#fn({ value })
    if (!result) return

    if (!result) result = {} as ValidatorResult

    // if (!('key' in result)) result.key = key
    if (!('type' in result)) result.type = null
    if (!('value' in result)) result.value = null

    return result as ValidatorResult & { key: string }
  }

  use(fn: (...args: any[]) => any) {
    this.#fn = fn
    return this
  }
}

function getValidatorFactory() {
  const validators = new Set<Validator>()
  const extractor = new n.Extractor<YAMLNode>()
  const docIter = new n.DocIterator()
  const docVisitor = new n.DocVisitor()
  const objAccumulator = new n.ObjAccumulator()

  extractor.use(docIter)
  extractor.use(docVisitor)
  extractor.use(objAccumulator)

  function validate(docs: YAMLNode | YAMLNode[]) {
    docs = u.array(docs)
    const results = [] as any[]

    docVisitor.use(({ name, key, value, path }) => {
      for (const validator of validators) {
        const result = validator.validate({ name, key, value, path })
        if (result) results.push(...u.array(result))
      }
    })

    return results
  }

  return {
    validate,
    use(validator: Validator) {
      validators.add(validator)
      return this
    },
  }
}

export default getValidatorFactory
