import { EnhancedStore, CombinedState } from '@reduxjs/toolkit'
import _ from 'lodash'
import { SerializedError } from 'app/types'

/**
 * Runs a series of functions from left to right, passing in the argument of the
 *    invokee to each function
 * @param { function[] } fns - Arguments of functions
 */

export function callAll(...fns: any[]) {
  return (...args: any[]) =>
    fns.forEach((fn) => typeof fn === 'function' && fn(...args))
}

/**
 * Takes a string that is a unicode, decodes it and returns the result
 *    (Useful for rendering raw unicode because react sanitizes input)
 * @param { string } value
 */
export function decodeUnicode(value: string) {
  return value.replace(/\\u(\w\w\w\w)/g, (a, b) => {
    return String.fromCharCode(parseInt(b, 16))
  })
}

/**
 * Runs forEach on each key/value pair of the value, passing in the key as the first
 * argument and the value as the second argument on each iteration
 * @param { object } value
 * @param { function } callback - Callback function to run on each key/value entry
 */
export function forEachEntries<Obj>(
  value: Obj,
  callback: <K extends keyof Obj>(key: K, value: Obj[K]) => void,
) {
  if (value && _.isObject(value)) {
    _.forEach(_.entries(value), _.spread(callback))
  }
}

/**
 * Runs forEach on each key/value pair of the value, passing in the key as the first
 * argument and the value as the second argument on each iteration.
 * This is a recursion version of forEachEntries
 * @param { object } value
 * @param { function } callback - Callback function to run on each key/value entry
 */
export function forEachDeepEntries<Obj>(
  value: Obj,
  callback: <K extends keyof Obj>(key: K, value: Obj[K]) => void,
) {
  if (value) {
    if (_.isArray(value)) {
      _.forEach(value, (val) => forEachDeepEntries(val, callback))
    } else if (_.isPlainObject(value)) {
      forEachEntries(value, (innerKey, innerValue: Obj[keyof Obj]) => {
        if (_.isPlainObject(innerValue)) {
          forEachDeepEntries(innerValue, callback as any)
        } else {
          callback(innerKey, innerValue)
        }
      })
    }
  }
}

/**
 * Runs reduce on each key/value pair of the value, passing in the key and value as an
 * object like { key, value } on each iteration as the second argument
 * @param { object } value
 * @param { function } callback - Callback to invoke on the key/value object. This function should be in the form of a reducer callback
 * @param { any? } initialValue - An optional initial value to start the accumulator with
 */
export function reduceEntries<Obj>(
  value: Obj,
  callback: <K extends keyof Obj>(
    acc: any,
    { key, value }: { key: K; value: Obj[K] },
    index: number,
  ) => typeof acc,
  initialValue?: any,
) {
  if (value && _.isObject(value)) {
    return _.reduce(
      _.entries(value),
      (acc, [key, value], index) =>
        callback(acc, { key: key as keyof Obj, value }, index),
      initialValue,
    )
  }
  return value
}

/**
 * Returns whether the web app is running on a mobile browser.
 * @return { boolean }
 */
export function isMobile() {
  if (typeof navigator?.userAgent !== 'string') {
    return false
  }
  return /Mobile/.test(navigator.userAgent)
}

/**
 * Returns true if process.env.REACT_APP_ECOS_ENV === 'stable', otherswise false
 */
export function isStableEnv() {
  return process.env.REACT_APP_ECOS_ENV === 'stable'
}

/** Returns true if the string is potentially a unicode string
 * @param { string } value
 */
export function isUnicode(value: unknown) {
  return _.isString(value) && value.startsWith('\\u')
}

/**
 * Utility to register observers to the store that is interested in changes to
 * some state slice. The returned function is a callback that unsubscribes itself
 * when called
 * @param { AppStore } store
 * @param { function } select - Selector that receives the state whenever it changes
 * @param { function } onChange - Callback function that will receive the updated state slice
 */
export function observeStore<StoreState, StateSlice>(
  store: EnhancedStore<CombinedState<StoreState>>,
  select: (state: StoreState) => StateSlice,
  onChange: (slice: StateSlice) => void,
) {
  let currentState: StateSlice

  function handleChange() {
    let nextState = select(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  let unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}

/**
 * Simulates a user-click and opens the link in a new tab.
 * @param { string } url - An outside link
 */
export function openOutboundURL(url: string) {
  if (typeof window !== 'undefined') {
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
    a.click()
  }
}

export function serializeError(
  error: Error & { code?: number; source?: string },
): SerializedError {
  if (!error) {
    return { name: '', message: '' }
  }
  const params: any = { name: error.name, message: error.message }
  if (typeof error.code !== 'undefined') {
    params.code = error.code
  }
  if (typeof error.source !== 'undefined') {
    params.source = error.source
  }
  return params
}

export type RequestStateChangePositionalKeywords = [
  K1: boolean,
  K2: boolean,
  K3: null | SerializedError,
  K4: boolean,
]

export interface S {
  [key: string]: null | SerializedError | boolean
}

/**
 * A helper to reset states back to the initial value when updating changes
 * to request states. This is used mainly for uses with immer
 * @param { string[] } keywords - Keywords prepending to the update keywords
 */
export function onRequestStateChange(
  ...keywords: [k1: string, k2: string, k3: string, k4: string]
) {
  const [k1, k2, k3, k4] = keywords
  return (state: any) => {
    state[k1] = false
    state[k2] = false
    state[k3] = null
    state[k4] = false
  }
}
