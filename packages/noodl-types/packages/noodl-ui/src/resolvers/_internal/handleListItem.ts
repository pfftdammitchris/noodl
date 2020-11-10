import _ from 'lodash'
import Logger from 'logsnap'
import createChild from '../../utils/createChild'
import { IList, IListItem, ResolverFn } from '../../types'
import { event } from '../../constants'

const log = Logger.create('internal[handleListItem')

const handleListItemResolver: ResolverFn = (component, options) => {
  const { resolveComponent } = options

  const parent = component.parent()
  if (parent?.noodlType === 'list') {
    // parent.on(event.component.list.UPDATE_LIST_ITEM, (result) => {
    //   component.setDataObject(result.dataObject)
    // })
  }
  // console.log('listItem', { componentJS: component.toJS(), component })

  _.forEach(component.children(), (child) => {
    // component.createChild(resolveComponent(createChild.call(component, child)))
  })

  if (component.original?.children) {
    const children = _.isArray(component.original.children)
      ? component.original.children
      : [component.original.children]

    _.forEach(children, (noodlChild) => {
      // const child = resolveComponent(
      //   component.createChild(createChild.call(component, noodlChild)),
      // )
      // child.setParent(component)
      resolveComponent(
        component.createChild(createChild.call(component, noodlChild)),
      )
      log.func('createChild')
      // log.gold('Created a child for listItem', child)
    })
  }
}

export default handleListItemResolver
