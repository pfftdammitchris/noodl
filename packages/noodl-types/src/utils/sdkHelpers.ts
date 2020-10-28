/**
 * Utilities for the SDK client is moved into this file because they are
 * currently breaking tests when being imported. To prevent this, we can
 * isolate the imports into this file and replace them with stubs in testing
 */
import _ from 'lodash'
import { Draft } from 'immer'
import Logger from 'logsnap'
import { getAllByDataKey } from 'noodl-utils'
import noodl from 'app/noodl'
import noodlui from 'app/noodl-ui'

const log = Logger.create('sdkHelpers.ts')

/** THIS IS EXPERIMENTAL AND WILL MOVE TO ANOTHER LOCATION */
export function createOnDataValueChangeFn(dataKey: string = '') {
  return (e: Event) => {
    const target:
      | (typeof e.target & {
          value?: string
        })
      | null = e.target

    const pageName = noodlui.getContext().page.name
    const localRoot = noodl?.root?.[pageName]
    const value = target?.value || ''

    let updatedValue

    if (_.has(localRoot, dataKey)) {
      noodl.editDraft((draft: Draft<{ [key: string]: any }>) => {
        if (_.has(draft?.[pageName], dataKey)) {
          _.set(draft?.[pageName], dataKey, value)
          /**
           * EXPERIMENTAL - When a data key from the local root is being updated
           * by a node, update all other nodes that are referencing it.
           * Note: This will not work for list items which is fine because they
           * reference their own data objects
           */
          const linkedNodes = getAllByDataKey(dataKey)
          if (linkedNodes.length) {
            _.forEach(linkedNodes, (node) => {
              // Since select elements have options as children, we should not
              // edit by innerHTML or we would have to unnecessarily re-render the nodes
              if (node.tagName === 'SELECT') {
                console.log(node)
              } else {
                node.innerHTML = `${value || ''}`
              }
            })
          }
        }
      })
      updatedValue = _.get(noodl.root?.[pageName], dataKey)
      if (updatedValue !== value) {
        log.func('createOnDataValueChangeFn')
        log.red(
          `Applied an update to a value using dataKey "${dataKey}" but the before/after values weren't equivalent`,
          { previousValue: value, nextValue: updatedValue, dataKey },
        )
      }
    } else {
      log.func('createOnDataValueChangeFn')
      log.red(
        `Attempted to attach a data binding "onChange" onto a textField component but the dataKey "${dataKey}" is not a valid path of the noodl root object`,
        { dataKey, localRoot, pageName, value },
      )
    }
  }
}

/** Handles onClick events for "goTo" handling.
 *    Ex: A NOODL page gives an onClick a value of "goToDashboard"
 *     The underlying function here will take a path string/regex and find a matching
 *     page path from the config, and will return the path if found.
 *     Otherwise it will return an empty string
 * @param { string } pageName
 */
export function getPagePath(pageName: string | RegExp) {
  // @ts-expect-error
  const pages = noodl?.cadlEndpoint?.page || noodl?.noodlEndpoint?.page || []
  const pagePath = _.find(pages, (name: string) =>
    _.isString(pageName)
      ? name.includes(pageName)
      : pageName instanceof RegExp
      ? pageName.test(name)
      : false,
  )
  // Ensure the first letter is capitalized
  return pagePath ? _.upperFirst(pagePath) : ''
}
