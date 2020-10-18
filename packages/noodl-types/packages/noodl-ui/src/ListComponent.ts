import _ from 'lodash'
import Component from './Component'
import {
  ComponentType,
  IComponent,
  IComponentConstructor,
  NOODLComponentType,
} from './types'

class ListComponent extends Component {
  #list: any[]

  constructor(...args: ConstructorParameters<IComponentConstructor>) {
    super(...args)
    this.#list = this.get('listObject') || []
  }

  addChild(child: ComponentType | NOODLComponentType) {
    let childComponent: IComponent
    if (_.isString(child)) {
      if (child === 'listItem') {
        //
      }
      childComponent = super.addChild(child)
    } else {
      if (child instanceof Component) {
        //
      } else {
        //
      }
    }
    return this
  }

  data() {
    return this.#list
  }

  iteratorVar() {
    return this.get('iteratorVar')
  }

  set(...args: Parameters<Component['set']>) {
    if (args[0] === 'listObject') this.#list = args[1]
    super.set(...args)
    return this
  }
}

export default ListComponent
