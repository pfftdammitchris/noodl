import { IComponentTypeInstance } from 'noodl-ui'

class Mediator<N extends HTMLElement, O extends IComponentTypeInstance> {
  node: N | null
  component: O

  constructor(node: N | null, component: O) {
    this.node = node
    this.component = component
  }
}

export default Mediator