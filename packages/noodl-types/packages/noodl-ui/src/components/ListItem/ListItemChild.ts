import _ from 'lodash'
import Component from '../Base'
import {
  IComponent,
  IComponentConstructor,
  IListItemChild,
  IListItem,
  IComponentTypeInstance,
} from '../../types'

class ListItemChildComponent extends Component implements IListItemChild {
  #listId: string = ''
  #iteratorVar: string = ''

  constructor(...args: ConstructorParameters<IComponentConstructor>) {
    super(...args)
  }

  get listId() {
    return this.#listId
  }

  set listId(listId) {
    this.#listId = listId
  }

  get iteratorVar() {
    return this.#iteratorVar
  }

  set iteratorVar(iteratorVar) {
    this.#iteratorVar = iteratorVar
  }

  get isListConsumer() {
    return true
  }

  createChild(...args: Parameters<IComponent['createChild']>) {
    return super
      .createChild(new ListItemChildComponent(...args))
      ?.set('listId', this.listId)
      .set('iteratorVar', this.iteratorVar)
  }

  getDataObject() {
    let parent: IComponentTypeInstance | null = super.parent()

    while (parent) {
      if (parent?.noodlType === 'listItem') {
        return (parent as IListItem).getDataObject()
      }
    }
  }

  setDataObject<T>(data: T) {
    // this.#dataObject = data
  }
}

export default ListItemChildComponent
