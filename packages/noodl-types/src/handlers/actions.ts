import _ from 'lodash'
import {
  Action,
  ActionChainActionCallback,
  ActionChainActionCallbackOptions,
  getByDataUX,
  isReference,
  NOODLActionType,
  NOODLEvalObject,
  NOODLPopupBaseObject,
  NOODLPopupDismissObject,
  NOODLRefreshObject,
  NOODLSaveObject,
  NOODLUpdateObject,
} from 'noodl-ui'
import Logger from 'logsnap'
import { IPage } from 'app/types'
import { onSelectFile } from 'utils/dom'

const log = Logger.create('actions.ts')

const createActions = function ({ page }: { page: IPage }) {
  const _actions = {} as Record<NOODLActionType, ActionChainActionCallback<any>>

  _actions.evalObject = async (action: Action<NOODLEvalObject>, options) => {
    if (_.isFunction(action?.original?.object)) {
      await action.original?.object()
    } else {
      log.func('evalObject')
      log.grey(
        `Expected to receive the "object" as a function but it was "${typeof action?.original}" instead`,
        { action, ...options },
      )
    }
  }

  _actions.goto = async (action: any, options) => {
    // URL
    if (_.isString(action)) {
      await page.requestPageChange(action)
    } else if (_.isPlainObject(action)) {
      // Currently don't know of any known properties the goto syntax has.
      // We will support a "destination" key since it exists on goto which will
      // soon be deprecated by this goto action
      if (action.original.destination || _.isString(action.original.goto)) {
        const url = action.original.destination || action.original.goto
        await page.requestPageChange(url)
      } else {
        log.func('goto')
        log.red(
          'Tried to go to a page but could not find information on the whereabouts',
          { action, ...options },
        )
      }
    }
  }

  _actions.pageJump = async (action: any, options) => {
    log.func('pageJump')
    log.grey('', { action, ...options })
    page.requestPageChange(action.original.destination)
  }

  _actions.popUp = (
    action: Action<NOODLPopupBaseObject | NOODLPopupDismissObject>,
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
      log.func('popUp')
      log.red(
        `Tried to render a ${action.original.actionType} element but the element was null or undefined`,
        { action, ...options },
      )
    }
  }

  _actions.popUpDismiss = async (action: any, options) => {
    return _actions.popUp(action, options)
  }

  _actions.refresh = (action: Action<NOODLRefreshObject>, options) => {
    log.func('refresh').grey(action.original.actionType, { action, ...options })
    window.location.reload()
  }

  _actions.saveObject = async (action: Action<NOODLSaveObject>, options) => {
    const { default: noodl } = await import('app/noodl')
    const { context, abort, parser } = options as any

    try {
      const { object } = action.original

      if (_.isFunction(object)) {
        log.func('saveObject')
        log.grey(`Directly invoking the object function with no parameters`, {
          action,
          ...options,
        })
        await object()
      } else if (_.isArray(object)) {
        const numObjects = object.length
        for (let index = 0; index < numObjects; index++) {
          const obj = object[index]
          if (_.isArray(obj)) {
            // Assuming this a tuple where the first item is the path to the "name" field
            // and the second item is the actual function that takes in values from using
            // the name field to retrieve values
            if (obj.length === 2) {
              const [nameFieldPath, save] = obj

              if (_.isString(nameFieldPath) && _.isFunction(save)) {
                parser.setLocalKey(context?.page?.name)

                let nameField

                if (isReference(nameFieldPath)) {
                  nameField = parser.get(nameFieldPath)
                } else {
                  nameField =
                    _.get(noodl?.root, nameFieldPath, null) ||
                    _.get(noodl?.root?.[context?.page?.name], nameFieldPath, {})
                }

                const params = { ...nameField }

                if ('verificationCode' in params) {
                  delete params.verificationCode
                }

                await save(params)
                log.func('saveObject')
                log.green(`Invoked saveObject with these parameters`, params)
              }
            }
          }
        }
      } else if (_.isString(object)) {
        log.func('saveObject')
        log.red(
          `The "object" property in the saveObject action is a string which ` +
            `is in the incorrect format. Possibly a parsing error?`,
          { action, ...options },
        )
      }
    } catch (error) {
      console.error(error)
      window.alert(error.message)
      return abort()
    }
  }

  _actions.updateObject = async (
    action: Action<NOODLUpdateObject>,
    options,
    { file }: { file?: File } = {},
  ) => {
    const { default: noodl } = await import('app/noodl')
    log.func('updateObject')

    async function callObject(
      object: any,
      options: ActionChainActionCallbackOptions & {
        action: any
        file?: File
      },
    ) {
      if (_.isFunction(object)) {
        await object()
      } else if (_.isString(object)) {
        log.red(
          `Received a string as an object property of updateObject. ` +
            `Possibly parsed incorrectly?`,
          { action, object, options },
        )
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
        let { dataKey, dataObject } = object
        if (/(file|blob)/i.test(dataObject)) {
          dataObject = file || dataObject
        }
        if (dataObject) {
          const params = { dataKey, dataObject }
          log.func('updateObject')
          log.green(`Parameters`, params)
          await noodl.updateObject(params)
        } else {
          log.red(`dataObject is null or undefined`, object)
        }
      }
    }

    try {
      const callObjectOptions = { action, file, ...options }
      log.info('callObjectOptions', callObjectOptions)
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

  return _.reduce(
    _.entries(_actions),
    (acc: typeof _actions, [key, fn]) => {
      acc[key as keyof typeof acc] = (action, options) => {
        const { component } = options
        if (component.get('contentType') === 'file') {
          // Components with contentType: "file" need a blob/file object
          // so we inject logic for the file input window to open for the user
          // to select a file from their file system before proceeding
          // the action chain
          return onSelectFile()
            .then((file: File) => fn(action, options, { file }))
            .catch((err) => {
              console.error(err)
              return fn(action, options)
            })
        }
        return fn(action, options)
      }
      return acc
    },
    {} as typeof _actions,
  )
}

export default createActions
