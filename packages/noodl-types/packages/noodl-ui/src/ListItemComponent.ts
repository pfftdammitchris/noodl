import _ from 'lodash'
import { createNOODLComponent } from './utils/noodl'
import Component from './Component'
import {
  ComponentType,
  IComponent,
  IComponentConstructor,
  NOODLComponentType,
} from './types'

class ListItemComponent extends Component {
  #dataObject: any

  constructor(...args: ConstructorParameters<IComponentConstructor>)
  constructor()
  constructor(...args: any | ConstructorParameters<IComponentConstructor>) {
    super(
      ...((args.length
        ? args
        : [{ type: 'listItem' }]) as ConstructorParameters<
        IComponentConstructor
      >),
    )
  }

  get iteratorVar() {
    return this.get('iteratorVar')
  }

  createChild(child: ComponentType | NOODLComponentType) {
    let childComponent: IComponent = super.createChild(child)
    let listItem: any
    if (child === 'listItem') {
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
    return this.#dataObject
  }

  setData(data: any) {
    this.#dataObject = data
  }

  set(...args: Parameters<Component['set']>) {
    if (args[0] === this.iteratorVar) this.setData(args[1])
    super.set(...args)
    return this
  }
}

export default ListItemComponent