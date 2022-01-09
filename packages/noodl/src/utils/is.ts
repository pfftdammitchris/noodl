import * as u from '@jsmanifest/utils'

export function typeOf(value: unknown) {
  if (u.isArr(value)) return 'array'
  if (value === null) return 'null'
  return typeof value
}
