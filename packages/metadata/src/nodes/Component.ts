import { YAMLMap } from 'yaml'

class Component<S extends string> extends YAMLMap<S> {
  type: S

  constructor(type: S) {
    super()
    this.type = type
  }
}

export default Component
