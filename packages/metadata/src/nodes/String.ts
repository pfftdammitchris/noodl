import * as nt from 'noodl-types'
import { Scalar } from 'yaml'

class NoodlString<V extends string> extends Scalar<string> {
  constructor(value: V) {
    super(value)
  }

  isStringifiedBoolean() {
    return this.value === 'true' || this.value === 'false'
  }

  isReference() {
    return nt.Identify.reference(this.value)
  }

  isLocalReference() {
    return this.isReference() && nt.Identify.localReference(this.value)
  }

  isRootReference() {
    return this.isReference() && nt.Identify.rootReference(this.value)
  }
}

export default NoodlString
