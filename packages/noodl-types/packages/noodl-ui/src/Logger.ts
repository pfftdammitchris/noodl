// This custom logger keeps the original stack track + line number
import _ from 'lodash'
import { forEachEntries } from './utils/common'

interface ILogger extends ColorFuncs {
  log: Console['log']
  id: string
  func(name: string): this
  initialize(): this
  stringifyArgs({
    color,
    data,
  }: {
    color?: string
    data?: any
  }): Parameters<Console['log']>
}

export const _color = {
  blue: '#0047ff',
  cyan: '#00D8C2',
  gold: '#c4a901',
  green: '#00b406',
  grey: '#95a5a6',
  hotpink: '#e50087',
  info: '#3498db',
  magenta: 'magenta',
  orange: '#FF5722',
  red: '#ec0000',
  salmon: 'salmon',
  teal: '#20B2AA',
  yellow: '#CCCD17',
} as const

type ColorKey = keyof typeof _color
type ColorFuncs = Record<ColorKey, Console['log']>

const Logger = (function () {
  const cache: { [loggerId: string]: ILogger } = {}
  const cons = window.console

  function get(id: string) {
    const _state = { id, func: '' }

    const o = {
      func(name?: string) {
        if (name) _state.func = name
        else _state.func = ''
        _refreshLoggers()
        return this
      },
      get id() {
        return _state.id
      },
      set id(id: string) {
        _state.id = id
      },
      log: cons.log.bind(cons, `[${id}] %s`),
    } as ILogger

    function _stringifyArgs({
      color,
      data,
    }: { color?: string; data?: any } = {}) {
      let msg = `[${_state.id}]`
      if (_state.func) msg += `[${_state.func}]`
      let args = [`%c${msg} %s`, `color:${color || _color.grey};`]
      if (data) args.push(data)
      return args
    }

    function _refreshLoggers() {
      forEachEntries(_color, (colorKey: ColorKey, color) => {
        o[colorKey] =
          process.env.NODE_ENV === 'test'
            ? _.noop
            : cons.log.bind(cons, ..._stringifyArgs({ color }))
      })
    }

    _refreshLoggers()

    return o
  }

  return {
    create(id: string) {
      let cached = cache[id as keyof typeof cache]
      let logger: ReturnType<typeof get>

      if (!cached) {
        logger = get(id)
        cache[id] = logger
      } else {
        logger = cached
      }
      return logger
    },
  }
})()

export default Logger
