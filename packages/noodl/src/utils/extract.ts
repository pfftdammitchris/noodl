import * as u from '@jsmanifest/utils'
import y from 'yaml'
import type { RootConfig } from 'noodl-types'
import { createPlaceholderReplacer } from 'noodl-utils'

export function extractAssetsUrlFromConfig(
  configProp: string | RootConfig,
  env = 'stable',
) {
  const config = (
    u.isStr(configProp) ? y.parse(configProp) : configProp
  ) as RootConfig

  if (u.isObj(config)) {
    const { cadlBaseUrl = '', web } = config
    if (cadlBaseUrl) {
      return createPlaceholderReplacer({
        // @ts-expect-error
        cadlBaseUrl: config.cadlBaseUrl,
        cadlVersion: web?.cadlVersion?.[env],
        designSuffix: '',
      })
    }
  }

  return ''
}
