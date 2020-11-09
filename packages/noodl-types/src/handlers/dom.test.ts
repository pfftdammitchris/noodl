import _ from 'lodash'
import sinon from 'sinon'
import userEvent from '@testing-library/user-event'
import MockAxios from 'axios-mock-adapter'
import { expect } from 'chai'
import { prettyDOM, screen, waitFor } from '@testing-library/dom'
import { IList, NOODLComponent } from 'noodl-ui'
import axios from '../app/axios'
import {
  assetsUrl,
  noodlui,
  queryByDataKey,
  queryByDataListId,
  queryByDataName,
  queryByDataUx,
  queryByDataValue,
  page,
} from '../utils/test-utils'

const mockAxios = new MockAxios(axios)

describe('dom', () => {
  describe('when creating any type of component', () => {
    it('should attach the id', () => {
      page.render({ type: 'button', style: {}, id: 'abc123' })
      expect(document.getElementById('abc123')).to.exist
    })
  })
  describe('component type: "label"', () => {
    it('should use data-value as text content if present for other elements (non data value elements)', () => {
      const dataKey = 'formData.greeting'
      const greeting = 'my greeting'
      noodlui.setRoot('SignIn', { formData: { greeting } }).setPage('SignIn')
      page.render({
        type: 'label',
        dataKey,
        placeholder: 'hello, all',
        id: 'id123',
      })
      const label = queryByDataKey(document.body, dataKey)
      // @ts-expect-error
      expect(label.value).to.be.undefined
      expect(label?.innerHTML).to.equal(greeting)
    })

    it('should use placeholder as text content if present (and also there is no data-value available) for other elements (non data value elements)', () => {
      const dataKey = 'formData.greeting'
      const placeholder = 'my placeholder'
      noodlui
        .setRoot('SignIn', { formData: { greeting: '' } })
        .setPage('SignIn')
      page.render({ type: 'label', dataKey, placeholder })
      const label = queryByDataKey(document.body, dataKey)
      // @ts-expect-error
      expect(label.value).to.be.undefined
      expect(label?.innerHTML).to.equal(placeholder)
    })
  })
  describe('component type: "list"', () => {
    it('should have the data-listid attribute', () => {
      page.render({ type: 'list', listObject: [], iteratorVar: 'hello' })
      expect(document.querySelector('ul')).to.exist
      expect(document.querySelector('ul')?.dataset).to.have.property('listid')
    })

    it('should start with no children if listObject is empty', () => {
      page.render({
        type: 'list',
        listObject: [],
        iteratorVar: 'hello',
        children: [{ type: 'listItem' }],
      })
      const listElem = document.querySelector('ul') as HTMLUListElement
      expect(listElem.children).to.have.lengthOf(0)
    })

    it('should start with some list item childrens if listObject has items', () => {
      page.render({
        type: 'list',
        listObject: [{ fruits: ['apple'] }, { fruits: ['banana'] }],
        iteratorVar: 'hello',
        children: [{ type: 'listItem' }],
      })
      const listElem = document.querySelector('ul')
      const listItemElems = document.querySelectorAll('li')
      console.info(prettyDOM())
      expect(listItemElems).to.have.lengthOf(2)
    })

    xit('should append a new list item node if a data object is added', () => {
      //
    })

    xit('should remove the corresponding list item node if its dataObject was removed', () => {
      //
    })

    xit('should update the corresponding list item node that is referencing the dataObject', () => {
      //
    })
  })

  xdescribe('component type: image', () => {
    it('should attach the src attribute', async () => {
      page.render({ type: 'image', path: 'img123.jpg', style: {} })
      await waitFor(() => {
        expect(
          document.querySelector(`img`),
          // document.querySelector(`img[src="${noodlui.assetsUrl}img123.jpg"]`),
        ).to.exist
      })
    })
  })

  xdescribe('component type: "plugin"', () => {
    it('should have ran the js script retrieved from the XHR request', async () => {
      const spy = sinon.spy()
      const div = document.createElement('div')
      div.id = 'testing'
      div.onclick = spy
      document.body.appendChild(div)
      const pathname = 'somejsfile.js'
      const url = `${assetsUrl}${pathname}`
      const content = `var s = 54;
      const abc = document.getElementById('testing');
      abc.click();`
      mockAxios.onGet(url).reply(200, content)
      page.render({ type: 'plugin', path: '/somejsfile.js' })
      await waitFor(() => {
        expect(spy.called).to.be.true
      })
    })
  })

  xdescribe('component type: "select"', () => {
    it('should show a default value for select elements', () => {
      page.render({
        type: 'select',
        'data-name': 'country',
        options: ['abc', '+52', '+86', '+965'],
      })
      const select = queryByDataName(document.body, 'country') as any
      expect(select?.value).to.equal('abc')
    })

    it('should create the select option children when rendering', () => {
      const options = ['abc', '123', 5, 1995]
      page.render({ type: 'select', options, id: 'myid123' })
      _.forEach(options, (option, index) => {
        expect(document.querySelector(`option[value="${options[index]}"]`)).to
          .exist
      })
    })
  })

  xdescribe('component type: "textField"', () => {
    it("should use the value computed from the dataKey as the element's value", () => {
      const dataKey = 'formData.greeting'
      const greeting = 'good morning'
      noodlui.setRoot('SignIn', { formData: { greeting } }).setPage('SignIn')
      page.render({ type: 'textField', placeholder: 'hello, all', dataKey })
      const input = queryByDataKey(document.body, dataKey) as any
      expect(input.value).to.equal(greeting)
    })

    it('should attach placeholders', () => {
      const placeholder = 'my placeholder'
      page.render({ type: 'textField', style: {}, placeholder })
      expect(screen.getByPlaceholderText(placeholder)).to.exist
    })

    _.forEach(
      [
        ['data-listid', queryByDataListId],
        ['data-name', queryByDataName],
        ['data-key', queryByDataKey],
        ['data-ux', queryByDataUx],
        ['data-value', queryByDataValue],
      ],
      ([key, queryFn]) => {
        it(`should attach ${key}`, () => {
          page.render({
            type: 'li',
            noodlType: 'listItem',
            id: 'id123',
            [key as string]: 'abc123',
          })
          expect((queryFn as Function)(document.body, 'abc123')).to.exist
        })
      },
    )

    describe('type: "textField" with contentType: "password"', () => {
      let eyeOpened = 'makePasswordVisiable.png'
      let eyeClosed = 'makePasswordInvisible.png'
      let regexTitlePwVisible = /click here to hide your password/i
      let regexTitlePwInvisible = /click here to reveal your password/i
      const noodlComponent = {
        type: 'textField',
        contentType: 'password',
        placeholder: 'your password',
      } as NOODLComponent

      it('should start off with hidden password mode for password inputs', async () => {
        page.render(noodlComponent)
        const input = (await screen.findByTestId(
          'password',
        )) as HTMLInputElement
        expect(input).to.exist
        expect(input.type).to.equal('password')
      })

      it('should start off showing the eye closed icon', async () => {
        page.render(noodlComponent)
        await waitFor(() => {
          const img = document.getElementsByTagName('img')[0]
          expect(img).to.exist
          expect(img.getAttribute('src')).to.eq(assetsUrl + eyeClosed)
        })
      })

      it('should flip the eye icon to open when clicked', async () => {
        page.render(noodlComponent)
        const eyeContainer = await screen.findByTitle(regexTitlePwInvisible)
        let img = document.querySelector('img')
        expect(img).to.exist
        expect(img?.getAttribute('src')).not.to.eq(assetsUrl + eyeOpened)
        await waitFor(() => {
          img = document.querySelector('img')
          expect(img?.getAttribute('src')).to.eq(assetsUrl + eyeClosed)
        })
        expect(eyeContainer).to.exist
        eyeContainer.click()
        img?.click()
      })
    })

    it('should update the value of input', () => {
      const dataKey = 'formData.phoneNumber'
      noodlui.setRoot('SignIn', { formData: { phoneNumber: '' } })
      noodlui.setPage('SignIn')
      page.render({
        type: 'textField',
        dataKey,
        placeholder: 'Enter your phone number',
      })
      const input = queryByDataKey(document.body, dataKey) as HTMLInputElement
      expect(input.value).to.eq('')
      userEvent.type(input, '6262465555')
      expect(input.value).to.equal('6262465555')
    })

    xit('should update the value of dataset.value', async () => {
      const dataKey = 'formData.phoneNumber'
      noodlui.setRoot('SignIn', { formData: { phoneNumber: '' } })
      noodlui.setPage('SignIn')
      page.render({
        type: 'textField',
        dataKey,
        placeholder: 'Enter your phone number',
      })
      const input = queryByDataKey(document.body, dataKey) as HTMLInputElement
      expect(input.dataset.value).to.eq('')
      userEvent.type(input, '6262465555')
      console.info(prettyDOM())
      expect(input.dataset.value).to.equal('6262465555')
    })
  })

  xdescribe('component type: "video"', () => {
    it('should attach poster if present', () => {
      page.render({
        type: 'video',
        poster: 'my-poster.jpeg',
      })
      const node = document.querySelector('video')
      expect(node?.getAttribute('poster')).to.equal(
        `${assetsUrl}my-poster.jpeg`,
      )
    })

    it('should have object-fit set to "contain"', () => {
      page.render({ type: 'video' })
      const node = document.querySelector('video')
      expect(node?.style.objectFit).to.equal('contain')
    })

    it('should create the source element as a child if the src is present', () => {
      page.render({ type: 'video', path: 'asdloldlas.mp4' })
      const node = document.querySelector('video')
      const sourceEl = node?.querySelector('source')
      expect(sourceEl).to.exist
    })

    it('should have src set on the child source element instead of the video element itself', () => {
      const path = 'asdloldlas.mp4'
      page.render({ type: 'video', path })
      const node = document.querySelector('video')
      const sourceEl = node?.querySelector('source')
      expect(node?.getAttribute('src')).not.to.equal(assetsUrl + path)
      expect(sourceEl?.getAttribute('src')).to.equal(assetsUrl + path)
    })

    it('should have the video type on the child source element instead of the video element itself', () => {
      page.render({ type: 'video', path: 'abc123.png', videoFormat: 'mp4' })
      const node = document.querySelector('video')
      const sourceEl = node?.querySelector('source')
      expect(node?.getAttribute('type')).not.to.equal('mp4')
      expect(sourceEl?.getAttribute('type')).to.equal(`video/mp4`)
    })

    it('should include the "browser not supported" message', () => {
      page.render({ type: 'video', path: 'abc.jpeg', videoFormat: 'mp4' })
      expect(screen.getByText(/sorry/i)).to.exist
    })

    it('should create a "source" element and attach the src attribute for video components', () => {
      const path = 'pathology.mp4'
      page.render({ type: 'video', path, videoFormat: 'mp4', id: 'id123' })
      const sourceElem = document.body?.querySelector('source')
      expect(sourceElem?.getAttribute('src')).to.equal(assetsUrl + path)
    })
  })
})
