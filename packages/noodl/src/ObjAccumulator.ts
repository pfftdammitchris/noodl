import * as t from './types'

class ObjAccumulator<
  V extends Record<string, any> = Record<string, any>,
> extends t.Accumulator<V> {
  value: V

  constructor() {
    super()
  }

  init() {
    this.value = {} as V
    return this.value
  }

  reduce(acc: V, name: string, result: any) {
    acc[name as keyof V] = result
    return acc
  }
}

export default ObjAccumulator
