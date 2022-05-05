import { NoodlObject } from 'noodl-builder'

class MetaObject<V extends Record<string, any>> extends NoodlObject {
  #value: V

  constructor(value: V) {
    super()
    this.#value = value
  }
}

export default MetaObject
