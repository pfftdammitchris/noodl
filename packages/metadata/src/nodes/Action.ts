import { YAMLMap } from 'yaml'

class Action<S extends string> extends YAMLMap<S> {
  actionType: S

  constructor(actionType: S) {
    super()
    this.actionType = actionType
  }
}

export default Action
