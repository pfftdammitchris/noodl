import type { LiteralUnion } from 'type-fest'
import * as u from '@jsmanifest/utils'
import y from 'yaml'
import type { AppConfig, Env, RootConfig } from 'noodl-types'
import { createNoodlPlaceholderReplacer } from 'noodl-utils'
import { typeOf } from './is'

export function extractAssetsUrl(
  configObjectOrYml: AppConfig | string | RootConfig,
  env?: Env,
): string

export function extractAssetsUrl(options: {
  baseUrl?: string
  cadlVersion?: LiteralUnion<'latest', string>
  rootConfig?: RootConfig
}): string

export function extractAssetsUrl(
  configObjectOrYml:
    | AppConfig
    | string
    | RootConfig
    | {
        baseUrl?: string
        cadlVersion?: LiteralUnion<'latest', string>
        rootConfig?: RootConfig
      },
  env: Env = 'stable',
) {
  let config: RootConfig | undefined

  if (u.isObj(configObjectOrYml)) {
    if ('rootConfig' in configObjectOrYml) {
      return extractAssetsUrl(configObjectOrYml.rootConfig, env)
    }
    if ('apiHost' in configObjectOrYml || 'startPage' in configObjectOrYml) {
      config = configObjectOrYml as RootConfig
    } else {
      throw new Error(
        `Tried to extract assetsUrl from an invalid argument. Expected a config object in options.rootConfig or as options but received ${typeOf(
          configObjectOrYml,
        )}`,
      )
    }
  } else if (u.isStr(configObjectOrYml)) {
    config = y.parse(configObjectOrYml)
  }
  if (u.isObj(config)) {
    const { cadlBaseUrl = '', web } = config
    if (cadlBaseUrl) {
      return createNoodlPlaceholderReplacer({
        cadlBaseUrl: config.cadlBaseUrl,
        cadlVersion: web?.cadlVersion?.[env],
        designSuffix: '',
      })(`${cadlBaseUrl}assets/`)
    }
  }
  return ''
}
