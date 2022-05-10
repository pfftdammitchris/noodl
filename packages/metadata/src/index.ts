import dotenv from 'dotenv'
dotenv.config()
export { is, pascalCase, tsm } from './utils.js'
export { default as createMetadataExtractor } from './validate'
export type { ExtractOptions, Plugin, VisitFnParamsObject } from './validate'
export {
  default as getValidatorFactory,
  KeyValidator,
  Validator,
} from './validatorFactory'

export { defaultPlugins } from './register'
export * from './types'
