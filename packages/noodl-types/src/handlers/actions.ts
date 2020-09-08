import _ from 'lodash'
import {
  Action,
  ActionChainActionCallback,
  ActionChainActionCallbackOptions,
  getByDataUX,
  isReference,
  NOODLActionChainActionType,
  NOODLChainActionEvalObject,
  NOODLChainActionPopupBaseObject,
  NOODLChainActionPopupDismissObject,
  NOODLChainActionRefreshObject,
  NOODLChainActionSaveObjectObject,
  NOODLChainActionUpdateObject,
} from 'noodl-ui'
import { cadl } from 'app/client'
import { AppStore } from 'app/types/storeTypes'
import Page from 'Page'
import { setPage } from 'features/page'

const makeActions = function ({
  store,
  page,
}: {
  store: AppStore
  page: Page
}) {
  // @ts-expect-error
  const _actions: Record<
    NOODLActionChainActionType,
    ActionChainActionCallback<any>
  > = {}

  _actions.evalObject = async (
    action: Action<NOODLChainActionEvalObject>,
    options,
  ) => {
    if (_.isFunction(action?.original?.object)) {
      action.original?.object()
    } else {
      const logMsg =
        `%c[actions.ts][evalObject] ` +
        `Expected to receive the "object" as a function but it was "${typeof action?.original}" instead`
      console.log(logMsg, `color:#3498db;font-weight:bold;`, {
        action,
        ...options,
      })
    }
  }

  _actions.goto = async (action: any, options) => {
    // URL
    if (_.isString(action)) {
      if (action.startsWith('http')) {
        await page.navigate(action)
      } else {
        store.dispatch(setPage(action))
      }
    } else if (_.isPlainObject(action)) {
      // Currently don't know of any known properties the goto syntax has.
      // We will support a "destination" key since it exists on goto which will
      // soon be deprecated by this goto action
      if (action.original.destination || _.isString(action.original.goto)) {
        const url = action.original.destination || action.original.goto
        if (url.startsWith('http')) {
          await page.navigate(url)
        } else {
          store.dispatch(setPage(url))
        }
      } else {
        const logMsg =
          '%c[actions.ts][goto] ' +
          'Tried to go to a page but could not find information on the whereabouts'
        console.log(logMsg, `color:#ec0000;font-weight:bold;`, {
          action,
          ...options,
        })
      }
    }
  }

  _actions.pageJump = async (action: any, options) => {
    const logMsg = `%c[actions.ts][pageJump]`
    console.log(logMsg, `color:#3498db;font-weight:bold;`, {
      action,
      ...options,
    })
    store.dispatch(setPage(action.destination))
  }

  _actions.popUp = (
    action: Action<
      NOODLChainActionPopupBaseObject | NOODLChainActionPopupDismissObject
    >,
    options,
  ) => {
    const elem = getByDataUX(action.original.popUpView) as HTMLElement
    if (elem) {
      if (action.original.actionType === 'popUp') {
        elem.style.visibility = 'visible'
      } else if (action.original.actionType === 'popUpDismiss') {
        elem.style.visibility = 'hidden'
      }
    } else {
      const logMsg =
        `%c[action.ts][popUp]` +
        `Tried to make a "${action.original.actionType}" element visible but the element node was null or undefined`
      console.log(logMsg, `color:#ec0000;font-weight:bold;`, {
        action,
        ...options,
      })
    }
  }

  _actions.popUpDismiss = async (action: any, options) => {
    return _actions.popUp(action, options)
  }

  _actions.refresh = (
    action: Action<NOODLChainActionRefreshObject>,
    options,
  ) => {
    const logMsg = `%c[action.ts][refresh] ${action.original.actionType}`
    console.log(logMsg, `color:#3498db;font-weight:bold;`, {
      action,
      ...options,
    })
    window.location.reload()
  }

  _actions.saveObject = async (
    action: Action<NOODLChainActionSaveObjectObject>,
    options,
  ) => {
    const logMsg = `%csaveObject`
    console.log(logMsg, `color:#4E25D2;font-weight:bold;`, {
      action,
      ...options,
    })
    const { context, dataValues, parser } = options

    try {
      const { object } = action.original

      const logMsg = `%c[action.ts][saveObject]`
      console.log(logMsg, `color:#3498db;font-weight:bold;`, {
        action,
        ...options,
      })

      if (_.isFunction(object)) {
        const logMsg =
          `%c[action.ts][saveObject] ` +
          `Directly invoking the object function with no parameters`
        console.log(logMsg, `color:#3498db;font-weight:bold;`, {
          action,
          options,
        })
        await object()
      } else if (_.isArray(object)) {
        for (let index = 0; index < object.length; index++) {
          const obj = object[index]

          if (_.isArray(obj)) {
            // Assuming this a tuple where the first item is the path to the "name" field
            // and the second item is the actual function that takes in values from using
            // the name field to retrieve values
            if (obj.length === 2) {
              const [nameFieldPath, save] = obj

              if (_.isString(nameFieldPath)) {
                if (_.isFunction(save)) {
                  parser.setLocalKey(context?.page?.name)

                  let nameField

                  if (isReference(nameFieldPath)) {
                    nameField = parser.get(nameFieldPath)
                  } else {
                    nameField =
                      _.get(cadl?.root, nameFieldPath, null) ||
                      _.get(
                        cadl?.root?.[context?.page?.name],
                        nameFieldPath,
                        {},
                      )
                  }

                  const params = { ...nameField }

                  if ('verificationCode' in params) {
                    delete params.verificationCode
                  }

                  const logMsg = `%c[action.ts][saveObject]`
                  console.log(logMsg, `color:#3498db;font-weight:bold;`, {
                    action,
                    dataValues,
                    params,
                    nameFieldPath,
                    ...options,
                  })

                  await save(params)
                }
              }
            } else {
              const logMsg =
                `%c[action.ts][saveObject] ` +
                `Received an array inside a "saveObject" action as an item of an ` +
                `"object" array. Currently we are using tuples of length 2`
              console.log(logMsg, `color:#ec0000;font-weight:bold;`, {
                action,
                ...options,
              })
            }
          }
        }
      } else if (_.isPlainObject(object)) {
        //
      } else {
        const logMsg =
          `%c[action.ts][saveObject] ` +
          `saveObject with property "object" was not received as a function, ` +
          `object or  Possibly a parsing error`
        console.log(logMsg, `color:#ec0000;font-weight:bold;`, {
          action,
          ...options,
        })
      }
    } catch (error) {
      console.error(error)
      window.alert(error.message)
      return 'abort'
    }
  }

  _actions.updateObject = async (
    action: Action<NOODLChainActionUpdateObject>,
    options,
  ) => {
    async function callObject(
      object: any,
      options: ActionChainActionCallbackOptions & {
        action: any
      },
    ) {
      if (_.isFunction(object)) {
        await object()
      } else if (_.isString(object)) {
        const logMsg =
          `%c[action.ts][updateObject] ` +
          `Received a string as an object property of updateObject. ` +
          `Possibly parsed incorrectly?`
        console.log(logMsg, `color:#ec0000;font-weight:bold;`, {
          object,
          options,
        })
      } else if (_.isArray(object)) {
        for (let index = 0; index < object.length; index++) {
          const obj = object[index]
          if (_.isFunction(obj)) {
            // Handle promises/functions separately because they need to be
            // awaited in this line for control flow
            await obj()
          } else {
            await callObject(obj, options)
          }
        }
      } else if (_.isObjectLike(object)) {
        const { dataKey, dataObject } = object
        if (dataObject) {
          console.log(dataObject)
          cadl.updateObject({ dataKey, dataObject })
        } else {
          const logMsg =
            `%c[action.ts][updateObject] ` + `dataObject is null or undefined`
          console.log(logMsg, `color:#ec0000;font-weight:bold;`)
        }
      }
    }

    try {
      const callObjectOptions = { action, ...options }
      const logMsg = `%c[action.ts][updateObject] callObjectOptions`
      console.log(logMsg, `color:#3498db;font-weight:bold;`, callObjectOptions)
      // This is the more older version of the updateObject action object where it used
      // the "object" property
      if ('object' in action.original) {
        await callObject(action.original.object, callObjectOptions)
      }
      // This is the more newer version that is more descriptive, utilizing the data key
      // action = { actionType: 'updateObject', dataKey, dataObject }
      else {
        if (action.original?.dataKey || action.original?.dataObject) {
          const object = _.omit(action.original, 'actionType')
          await callObject(object, callObjectOptions)
        }
      }
    } catch (error) {
      console.error(error)
      window.alert(error.message)
    }
  }

  return _actions
}

export default makeActions
