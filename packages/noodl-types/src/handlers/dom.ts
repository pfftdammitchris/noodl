import _ from 'lodash'
import Logger from 'logsnap'
import {
  event as noodluiEvent,
  eventTypes,
  IList,
  SelectOption,
} from 'noodl-ui'
import { isBooleanTrue, isTextFieldLike } from 'noodl-utils'
import { forEachEntries } from 'utils/common'
import { isDisplayable } from 'utils/dom'
import createElement from 'utils/createElement'
import noodluidom from 'app/noodl-ui-dom'

const log = Logger.create('dom.ts')

// TODO: Consider extending this to be better. We'll hard code this logic for now
// This event is called for all components
noodluidom.on('create.component', (node, component) => {
  if (!node) return

  const {
    children,
    id = '',
    options,
    placeholder = '',
    src,
    text = '',
    type = '',
    videoFormat = '',
  } = component.get([
    'children',
    'id',
    'options',
    'placeholder',
    'src',
    'text',
    'type',
    'videoFormat',
  ])

  const { style } = component

  // TODO reminder: Remove this listdata in the noodl-ui client
  // const dataListData = component['data-listdata']

  const datasetAttribs = component.get([
    'data-listid',
    'data-name',
    'data-key',
    'data-ux',
    'data-value',
  ])

  if (id) node['id'] = id
  if (placeholder) node.setAttribute('placeholder', placeholder)
  if (src && type !== 'video') node.setAttribute('src', src)

  /** Dataset identifiers */
  if (datasetAttribs['data-listid'])
    node.dataset['listid'] = datasetAttribs['data-listid']
  if (datasetAttribs['data-name'])
    node.dataset['name'] = datasetAttribs['data-name']
  if (datasetAttribs['data-key'])
    node.dataset['key'] = datasetAttribs['data-key']
  if (datasetAttribs['data-ux']) node.dataset['ux'] = datasetAttribs['data-ux']
  if (datasetAttribs['data-value']) {
    node.dataset['value'] = datasetAttribs['data-value']
    if ('value' in node) node.value = datasetAttribs['data-value']
  }

  /** Data values */
  if (isTextFieldLike(node)) {
    node['value'] = datasetAttribs['data-value'] || ''
    if (node.tagName === 'SELECT') {
      if ((node as HTMLSelectElement).length) {
        // Put the default value to the first option in the list
        ;(node as HTMLSelectElement)['selectedIndex'] = 0
      }
    } else {
      node.dataset['value'] = node.value || ''
      node['value'] = datasetAttribs['data-value'] || ''
    }

    // Attach an additional listener for data-value elements that are expected
    // to change values on the fly by some "on change" logic (ex: input/select elements)
    import('utils/sdkHelpers')
      .then(({ createOnDataValueChangeFn }) => {
        const onChange = createOnDataValueChangeFn(datasetAttribs['data-key'])
        node.addEventListener('change', onChange)
      })
      .catch((err) => (log.func('noodluidom.on: all'), log.red(err.message)))
  } else if (component.get('text=func') && datasetAttribs['data-value']) {
    node.innerHTML = datasetAttribs['data-value']
  } else {
    // For non data-value elements like labels or divs that just display content
    // If there's no data-value (which takes precedence here), use the placeholder
    // to display as a fallback
    let text = ''
    text = datasetAttribs['data-value'] || ''
    if (!text && children) text = `${children}` || ''
    if (!text && placeholder) text = placeholder
    if (!text) text = ''
    if (text) node.innerHTML = `${text}`
    node['innerHTML'] =
      datasetAttribs['data-value'] || component.get('placeholder') || ''
  }

  /** Event handlers */
  _.forEach(eventTypes, (eventType) => {
    const handler = component.get(eventType)
    if (handler) {
      const event = (eventType.startsWith('on')
        ? eventType.replace('on', '')
        : eventType
      ).toLocaleLowerCase()

      // TODO: Test this
      // Attach the event handler
      node.addEventListener(event, (...args: any[]) => {
        log.func(`on all --> addEventListener: ${event}`)
        log.grey(`User action invoked handler`, { component, [event]: handler })
        console.groupCollapsed('', { event, node, component })
        console.trace()
        console.groupEnd()
        return handler(...args)
      })
    }
  })

  /** Styles */
  if (_.isPlainObject(style)) {
    forEachEntries(style, (k, v) => (node.style[k as any] = v))
  } else {
    log.func('noodluidom.on: all')
    log.red(
      `Expected a style object but received ${typeof style} instead`,
      style,
    )
  }

  /** Children */
  if (options) {
    if (type === 'select') {
      if (_.isArray(options)) {
        _.forEach(options, (option: SelectOption, index) => {
          if (option) {
            const optionElem = document.createElement('option')
            optionElem['id'] = option.key
            optionElem['value'] = option?.value
            optionElem['innerText'] = option.label
            node.appendChild(optionElem)
            if (option?.value === datasetAttribs['data-value']) {
              // Default to the selected index if the user already has a state set before
              ;(node as HTMLSelectElement)['selectedIndex'] = index
            }
          } else {
            // TODO: log
          }
        })
        // Default to the first item if the user did not previously set their state
        if ((node as HTMLSelectElement).selectedIndex == -1) {
          ;(node as HTMLSelectElement)['selectedIndex'] = 0
        }
      } else {
        // TODO: log
      }
    }
  }

  if (!node.innerHTML.trim()) {
    if (isDisplayable(datasetAttribs['data-value'])) {
      node.innerHTML = `${datasetAttribs['data-value']}`
    } else if (isDisplayable(children)) {
      node.innerHTML = `${children}`
    } else if (isDisplayable(text)) {
      node.innerHTML = `${text}`
    }
  }

  // if (component.node) {
  //   const parentNode = parent?.node
  //   if (parentNode) {
  //     parentNode.appendChild(component.node)
  //   }
  // }
})

noodluidom.on('create.button', (node, component) => {
  if (node) {
    const { onClick: onClickProp, src } = component.get(['onClick', 'src'])
    /**
     * Buttons that have a "src" property
     * ? NOTE: Seems like these components are deprecated. Leave this here for now
     */
    if (src) {
      const img = document.createElement('img')
      img.src = src
      img.style['width'] = '35%'
      img.style['height'] = '35%'
      node.style['overflow'] = 'hidden'
      node.style['display'] = 'flex'
      node.style['alignItems'] = 'center'
    }
    node.style['cursor'] = _.isFunction(onClickProp) ? 'pointer' : 'auto'
  }
})

noodluidom.on('create.image', function onCreateImage(node, component) {
  if (node) {
    const onClick = component.get('onClick')

    if (_.isFunction(onClick)) {
      node.style['cursor'] = 'pointer'
    }

    // If an image has children, we will assume it is some icon button overlapping
    //    Ex: profile photos and showing pencil icon on top to change it
    if (component.original?.children) {
      log.func('create.image: Image')
      log.orange(
        `An image component has children. This is a weird practice. Consider ` +
          `discussion about this`,
        component.toJS(),
      )
      node.style['width'] = '100%'
      node.style['height'] = '100%'
    }

    import('app/noodl-ui').then(({ default: noodlui }) => {
      const parent = component.parent()
      const context = noodlui.getContext()
      const pageObject = noodlui.root[context?.page || ''] || {}
      if (
        // @ts-expect-error
        node?.src === pageObject?.docDetail?.document?.name?.data &&
        pageObject?.docDetail?.document?.name?.type == 'application/pdf'
      ) {
        node.style.visibility = 'hidden'
        const parentNode = document.getElementById(parent?.id || '')
        const iframeEl = document.createElement('iframe')
        // @ts-expect-error
        iframeEl.setAttribute('src', node.src)

        if (_.isPlainObject(component.style)) {
          forEachEntries(
            component.style,
            (k, v) => (iframeEl.style[k as any] = v),
          )
        } else {
          log.func('noodluidom.on: all')
          log.red(
            `Expected a style object but received "${typeof component.style}" instead`,
            component.style,
          )
        }
        parentNode?.appendChild(iframeEl)
      }
    })
  }
})

noodluidom.on('create.label', (node, component) => {
  if (node) {
    const dataValue = component.get('data-value')
    const { placeholder, text } = component.get(['placeholder', 'text'])
    if (dataValue) node.innerHTML = dataValue
    else if (text) node.innerHTML = text
    else if (placeholder) node.innerHTML = placeholder
    if (_.isFunction(component.get('onClick'))) {
      node.style['cursor'] = 'pointer'
    }
  }
})

noodluidom.on<'list'>(
  'create.list',
  (node: HTMLUListElement, component: IList) => {
    log.func('create.list')

    component.on(
      noodluiEvent.component.list.CREATE_LIST_ITEM,
      (result, options) => {
        log.func(`create.list[${noodluiEvent.component.list.CREATE_LIST_ITEM}]`)
        log.grey('', { ...result, ...options })
        const { listItem } = result
        const childNode = noodluidom.parse(listItem)
        log.gold(
          `${
            childNode ? 'Created' : 'Could not create'
          } childNode for list item`,
          { node, childNode, component, listItem },
        )
      },
    )

    component.on(
      noodluiEvent.component.list.REMOVE_LIST_ITEM,
      (result, options) => {
        log.func(`create.list[${noodluiEvent.component.list.REMOVE_LIST_ITEM}]`)
        log.grey('', { ...result, ...options })
        const { listItem, successs } = result
        const childNode = document.getElementById(listItem.id)
        if (childNode) {
          log.gold(
            'Found childNode for removed listItem. Removing it from the DOM now',
            {
              ...result,
              ...options,
              childNode,
            },
          )
          node.removeChild(childNode)
        } else {
          log.red(`Could not find the child DOM node for a removed listItem`, {
            ...result,
            ...options,
            childNode,
          })
        }
      },
    )

    component.on(
      noodluiEvent.component.list.RETRIEVE_LIST_ITEM,
      (result, options) => {
        log.func(
          `create.list[${noodluiEvent.component.list.RETRIEVE_LIST_ITEM}]`,
        )
        log.grey('', { ...result, ...options })
      },
    )

    component.on(
      noodluiEvent.component.list.UPDATE_LIST_ITEM,
      (result, options) => {
        log.func(`create.list[${noodluiEvent.component.list.UPDATE_LIST_ITEM}]`)
        log.grey('', { ...result, ...options })
        const { listItem, success } = result
        const childNode = document.getElementById(listItem.id)
        if (childNode) {
          log.gold(`Reached the childNode block for an updated listItem`, {
            ...result,
            ...options,
            childNode,
          })
        } else {
          log.red(`Could not find the DOM node for an updated listItem`, {
            ...result,
            ...options,
            listItem,
            childNode,
          })
        }
      },
    )
  },
)

noodluidom.on('create.list.item', (node, component) => {
  log.func('create.list.item')
  // log.gold('Entered listItem node/component', {
  //   node,
  //   component: component.toJS(),
  // })
})

// /** NOTE: node is null in this handler */
noodluidom.on('create.plugin', async function (noop, component) {
  log.func('create.plugin')
  const { src = '' } = component.get('src')
  if (_.isString(src)) {
    if (src.startsWith('http')) {
      const { default: axios } = await import('app/axios')
      const { data } = await axios.get(src)
      /**
       * TODO - Check the ext of the filename
       * TODO - If its js, run eval on it
       */
      try {
        eval(data)
      } catch (error) {
        console.error(error)
      }
    } else {
      log.red(
        `Received a src from a "plugin" component that did not start with an http(s) protocol`,
        { component: component.toJS(), src },
      )
    }
  }
})

noodluidom.on('create.textfield', (node, component) => {
  if (node) {
    const contentType = component.get('contentType')
    // Password inputs
    if (contentType === 'password') {
      if (!node?.dataset.mods?.includes('[password.eye.toggle]')) {
        import('app/noodl-ui').then(({ default: noodlui }) => {
          const assetsUrl = noodlui.getContext()?.assetsUrl || ''
          const eyeOpened = assetsUrl + 'makePasswordVisiable.png'
          const eyeClosed = assetsUrl + 'makePasswordInvisible.png'
          const originalParent = node?.parentNode as HTMLDivElement
          // const originalParent = node?.parentNode as HTMLDivElement
          const newParent = document.createElement('div')
          const eyeContainer = document.createElement('button')
          const eyeIcon = document.createElement('img')

          // const restDividedStyleKeys = _.omit(component.style, dividedStyleKeys)

          // Transfering the positioning/sizing attrs to the parent so we can customize with icons and others
          const dividedStyleKeys = [
            'position',
            'left',
            'top',
            'right',
            'bottom',
            'width',
            'height',
          ] as const

          // Transfer styles to the new parent to position our custom elements
          _.forEach(dividedStyleKeys, (styleKey) => {
            newParent.style[styleKey] = component.style?.[styleKey]
            // Remove the transfered styles from the original input element
            node.style[styleKey] = ''
          })

          newParent.style['display'] = 'flex'
          newParent.style['alignItems'] = 'center'
          newParent.style['background'] = 'none'

          node.style['width'] = '100%'
          node.style['height'] = '100%'

          eyeContainer.style['top'] = '0px'
          eyeContainer.style['bottom'] = '0px'
          eyeContainer.style['right'] = '6px'
          eyeContainer.style['width'] = '42px'
          eyeContainer.style['background'] = 'none'
          eyeContainer.style['border'] = '0px'
          eyeContainer.style['outline'] = 'none'

          eyeIcon.style['width'] = '100%'
          eyeIcon.style['height'] = '100%'
          eyeIcon.style['userSelect'] = 'none'

          eyeIcon.setAttribute('src', eyeClosed)
          eyeContainer.setAttribute(
            'title',
            'Click here to reveal your password',
          )
          node.setAttribute('type', 'password')
          node.setAttribute('data-testid', 'password')

          // Restructing the node structure to match our custom effects with the
          // toggling of the eye iconsf

          if (originalParent) {
            if (originalParent.contains(node)) originalParent.removeChild(node)
            originalParent.appendChild(newParent)
          }
          eyeContainer.appendChild(eyeIcon)
          newParent.appendChild(node)
          newParent.appendChild(eyeContainer)

          let selected = false

          function onClick(e: Event) {
            if (selected) {
              eyeIcon.setAttribute('src', eyeOpened)
              node?.setAttribute('type', 'text')
            } else {
              eyeIcon.setAttribute('src', eyeClosed)
              node?.setAttribute('type', 'password')
            }
            selected = !selected
            eyeContainer['title'] = !selected
              ? 'Click here to hide your password'
              : 'Click here to reveal your password'
          }
          eyeIcon.dataset.mods = ''
          eyeIcon.dataset.mods += '[password.eye.toggle]'
          eyeContainer.addEventListener('click', onClick)
        })
      }
    } else {
      // Set to "text" by default
      node.setAttribute('type', 'text')
    }
  }
})

noodluidom.on('create.video', (node, component) => {
  const { controls, poster, src, videoType } = component.get([
    'controls',
    'poster',
    'src',
    'videoType',
  ])
  if (node) {
    const videoEl = node as HTMLVideoElement
    let sourceEl: HTMLSourceElement
    let notSupportedEl: HTMLParagraphElement
    videoEl['controls'] = isBooleanTrue(controls) ? true : false
    if (poster) videoEl.setAttribute('poster', poster)
    if (src) {
      sourceEl = createElement('source')
      notSupportedEl = createElement('p')
      if (videoType) sourceEl.setAttribute('type', videoType)
      sourceEl.setAttribute('src', src)
      notSupportedEl.style['textAlign'] = 'center'
      // This text will not appear unless the browser isn't able to play the video
      notSupportedEl.innerHTML =
        "Sorry, your browser doesn's support embedded videos."
      videoEl.appendChild(sourceEl)
      videoEl.appendChild(notSupportedEl)
    }
  }
})
