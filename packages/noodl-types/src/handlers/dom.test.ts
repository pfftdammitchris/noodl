import _ from 'lodash'
import sinon from 'sinon'
import nock from 'nock'
import NOODLUIDOM, { DataValueElement } from 'noodl-ui-dom'
import { expect } from 'chai'
import { getByText, prettyDOM } from '@testing-library/dom'
import {
  NOODLComponent,
  NOODLPluginComponent,
  NOODLComponentProps,
} from 'noodl-ui'
import noodluidom from '../app/noodl-ui-dom'
import { mapUserEvent, noodl } from '../utils/test-utils'
import './dom'

let container: HTMLDivElement
let parser: NOODLUIDOM

beforeEach(() => {
  container = document.createElement('div')
  parser = new NOODLUIDOM()
})

afterEach(() => {
  // console.info(prettyDOM(container))
})

describe('dom', () => {
  it('should create a script node and attach the src and append it to the DOM', () => {
    const url = 'https://www.somescript.com'
    nock(url).get('/asd.js').reply(200, {
      data: '<script type="text/javascript">var $zoho="asfsafsa";</script>',
    })
    const component = {
      type: 'plugin',
      path: url,
    } as NOODLPluginComponent
    const resolvedComponent = noodl.resolveComponents(component)[0]
    noodluidom.parse(resolvedComponent)
    console.info(resolvedComponent)
    console.info(prettyDOM())
  })

  describe.skip('parse', () => {
    let components: NOODLComponentProps[]
    let component: NOODLComponentProps

    beforeEach(() => {
      components = noodl.resolveComponents({
        module: 'patient',
        components: [
          {
            type: 'button',
            text: 'hello',
            onClick: [
              {
                actionType: 'builtIn',
                funcName: 'toggleMicrophoneOnOff',
              },
            ],
            style: {
              left: '0.22',
              top: '0.0185',
              width: '0.12',
              height: '0.07',
              border: {
                style: '2',
              },
            },
          } as NOODLComponent,
        ],
      })
      // console.info(components)
      component = components[0]
    })

    describe.skip('record keeper (wrapper)', () => {
      describe('hasAttribute', () => {
        it('should return false', () => {
          const div = document.createElement('div')
          // const parse =
        })
      })
    })

    describe.skip('parseChildren', () => {
      beforeEach(() => {
        // parser.add(parseChildren as any)
      })

      it('should append to innerHTML if children is a string', () => {
        const node = parser.parse(component)
        node && container.appendChild(node)
        expect(node?.innerHTML).to.eq('hello')
      })

      it('should attach children DOM nodes', () => {
        // @ts-expect-error
        component.children = [
          {
            type: 'label',
            text: 'i am child #1',
            style: { width: '0.2', height: '0.5' },
          },
          {
            type: 'button',
            text: 'i am child #2',
            style: { width: '0.2', height: '0.5' },
          },
          {
            type: 'view',
            id: 'abc',
            style: { width: '0.2', height: '0.5' },
            children: [
              {
                type: 'label',
                text: 'I am a nested child of view',
                style: { width: '0.2', height: '0.5' },
              },
            ],
          },
        ] as NOODLComponent[]
        // @ts-expect-error
        const resolvedComponents = noodl.resolveComponents({
          module: 'patient',
          components: component.children,
        })
        const label = resolvedComponents[0]
        const button = resolvedComponents[1]
        const view = resolvedComponents[2]
        expect(parser.parse(label)?.textContent).to.eq('i am child #1')
        expect(parser.parse(button)?.textContent).to.eq('i am child #2')
        expect(parser.parse(view)?.children.length).to.eq(1)
        const node = parser.parse({
          type: 'div',
          children: resolvedComponents,
        }) as HTMLElement
        const labelNode = getByText(node, 'I am a nested child of view')
        const viewNode = node.children[2]
        expect(viewNode).to.exist
        expect(labelNode).to.exist
        expect(labelNode.parentNode).to.eq(viewNode)
      })
    })

    describe.skip('parseEventHandlers', () => {
      beforeEach(() => {
        // parser.add(parseEventHandlers)
      })

      _.forEach(
        ['onClick', 'onMouseEnter', 'onMouseLeave'] as const,
        (eventType) => {
          it(`should attach the "${eventType}" event handler`, () => {
            const handler = sinon.spy()
            component[eventType] = handler as any
            const node = parser.parse(component)
            node && container.appendChild(node)
            node && mapUserEvent(eventType)?.(node)
            expect(handler.called).to.be.true
          })
        },
      )

      it.skip('should increment the listener count if a listener is added via addEventListener', () => {
        //
      })
    })

    describe.skip('parseStyles', () => {
      beforeEach(() => {
        // parser.add(parseStyles)
      })

      it('should attach style attributes', () => {
        const node = parser.parse(component)
        node && container.appendChild(node)
        expect(node?.style.borderRadius).to.eq('0px')
        expect(node?.style.borderStyle).to.eq('none')
        expect(node?.style.borderBottomStyle).to.eq('solid')
      })
    })

    describe.skip('parseDataValues', () => {
      beforeEach(() => {})

      _.forEach(['input', 'select', 'textarea'] as const, (tag) => {
        it(`should attach the value of data-value as the value for ${tag} elements`, () => {
          let node: DataValueElement | undefined
          const dataValue = 'fruits'
          component['data-value'] = dataValue
          component['type'] = tag
          if (tag === 'select') {
            component['data-value'] = 'banana'
            component['options'] = [
              { value: 'apple', key: 'apple', label: 'Apple' },
              { value: 'banana', key: 'banana', label: 'Banana' },
            ]
            node = parser.parse(component) as DataValueElement
            expect(node?.value).to.eq('apple')
          } else {
            node = parser.parse(component) as DataValueElement
            expect(node?.value).to.eq(dataValue)
          }
        })
      })
    })
  })
})
