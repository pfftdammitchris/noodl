import _ from 'lodash'
import sinon from 'sinon'
import { expect } from 'chai'
import { IComponent } from '../types'
import Component from '../Component'

let component: IComponent

beforeEach(() => {
  component = new Component({
    type: 'view',
    viewTag: 'subStream',
    required: 'false',
    style: {
      borderRadius: '5',
      border: {
        style: '5',
      },
      fontStyle: 'bold',
      left: '0.015',
    },
  }) as IComponent
})

describe('Component', () => {
  it('should start with an ID', () => {
    expect(!!component.id).to.be.true
  })

  it('should start with "drafting" status when constructed', () => {
    expect(component.status).to.eq('drafting')
  })

  it('should populate touched/untouched keys in the beginning', () => {
    expect(component.untouched).to.include.members(['type', 'viewTag', 'style'])
  })

  it('should add to touched', () => {
    expect(component.touched).not.to.have.members(['type'])
    component.touch('type')
    expect(component.touched).to.have.members(['type'])
  })

  it('should add to untouched when touching a key', () => {
    expect(component.untouched.includes('type')).to.be.true
    component.touch('type')
    expect(component.untouched.includes('type')).to.be.false
  })

  it('should add to touched style', () => {
    expect(component.stylesUntouched.includes('fontStyle')).to.be.true
    component.touchStyle('fontStyle')
    expect(component.stylesUntouched.includes('fontStyle')).to.be.false
    expect(component.stylesTouched.includes('fontStyle')).to.be.true
  })

  it('should switch between "drafting" and "idle" when calling draft() and done()', () => {
    component.done()
    expect(component.status).to.eq('idle')
    component.draft()
    expect(component.status).to.eq('drafting')
    component.done()
  })

  it('should be able to retrieve styles', () => {
    component.setStyle('fontSize', '25px')
    expect(component.getStyle('fontSize')).to.equal('25px')
  })

  it('should be able to check if some style exists', () => {
    component.setStyle('border', { style: '5' })
    expect(component.getStyle('border')).to.deep.eq({ style: '5' })
  })

  it('should be able to remove styles', () => {
    component.removeStyle('border')
    expect(component.hasStyle('border')).to.be.false
  })

  it('should be able to assign styles into the style obj', () => {
    const incomingStyles = { borderWidth: '12px', textColor: '#ffffff' }
    expect(component.getStyle('borderWidth')).to.be.undefined
    expect(component.getStyle('textColor')).to.be.undefined
    component.assign('style', incomingStyles)
    expect(component.getStyle('borderWidth')).to.equal('12px')
    expect(component.getStyle('textColor')).to.equal('#ffffff')
    component.removeStyle('borderWidth')
    component.removeStyle('textColor')
    expect(component.getStyle('borderWidth')).to.be.undefined
    expect(component.getStyle('textColor')).to.be.undefined
    component.assignStyles(incomingStyles)
    expect(component.getStyle('borderWidth')).to.equal('12px')
    expect(component.getStyle('textColor')).to.equal('#ffffff')
  })

  it('should merge in untouched props if set to true', () => {
    console.info(component.done)
    component.set('path', 'https://www.google.com')
    component.done({ mergeUntouched: true })
  })

  describe('working with children', () => {
    beforeEach(() => {
      component.id = 'abc123'
      component.createChild({
        type: 'button',
        text: 'hello',
        style: { width: '0.2', height: '0.2' },
      })
      component.createChild({
        type: 'textField',
        contentType: 'text',
        placeholder: 'Please type the title here',
        dataKey: 'newRoomInfo.edge.name.roomName',
        style: {
          left: '0',
          top: '0.13',
          width: '0.89333',
          height: '0.05',
          color: '0x00000088',
        },
      })
    })

    it('should assign a suffix to children with index accessor format in zero indexed ascending order', () => {
      const child1 = { type: 'button' }
      const child2 = { type: 'textField' }
      component = new Component({
        type: 'view',
        viewTag: 'subStream',
        required: 'false',
      })
      component.createChild(child1)
      component.createChild(child2)
      component.createChild(child2)
      component.createChild(child2)
      expect(component.child().id.endsWith('[0]')).to.be.true
    })

    it('should set the noodlType on instantiation', () => {
      expect(component.get('noodlType')).to.equal(component.type)
    })

    it('"done" should not continue its code if the status property is not "drafting"', () => {
      const spy = sinon.spy()
      component.on('resolved', spy)
      component.done()
      expect(spy.getCalls()).to.have.lengthOf(1)
      component.done()
      expect(spy.getCalls()).to.have.lengthOf(1)
    })

    it('should return all of its children', () => {
      expect(component.children()).to.have.lengthOf(2)
    })

    it('should prefix the ids of their children with its own component id', () => {
      _.forEach(component.children() as IComponent[], (child) => {
        expect(child.id.startsWith(component.id)).to.be.true
      })
    })

    it('should allow children to get access to this instance', () => {
      const children = component.children() as IComponent[]
      _.forEach(children, (child) => {
        expect(child.parent()).to.equal(component)
      })
    })

    it('should be able to walk down the children hierarchy', () => {
      const nestedChild = component.child(1).createChild({
        type: 'view',
        style: { border: { style: '2' } },
        dataKey: 'hello.bro',
      })
      const nestedChildChild = nestedChild.createChild({
        type: 'button',
        path: 'sfasfsaasfas.png',
        style: {},
      })
      const nestedChildChild2 = nestedChild.createChild({
        type: 'label',
        style: {},
      })

      expect(component.child(1).child(0)).to.equal(nestedChild)
      expect(component.child(1).child().child(0)).to.equal(nestedChildChild)
      expect(component.child(1).child().child(1)).to.equal(nestedChildChild2)
    })

    it('should remove the first child if args is empty', () => {
      const firstChild = component.child(0)
      expect(component).to.have.lengthOf(2)
      component.removeChild()
      expect(component).to.have.lengthOf(1)
      expect(component.child()).to.not.equal(firstChild)
    })

    it('should be able to remove a child by index', () => {
      const firstChild = component.child(0)
      component.removeChild(1)
      expect(component).to.have.lengthOf(1)
      expect(component.child()).to.equal(firstChild)
      component.removeChild(0)
      expect(component.child()).to.be.null
    })

    it('should be able to remove a child by using the direct reference to the instance', () => {
      const firstChild = component.child()
      const secondChild = component.child(1)
      component.removeChild(firstChild)
      expect(component.child()).to.equal(secondChild)
    })

    xit('should convert all of its children to Component instance during the constructor', () => {
      const child = new Component({
        type: 'view',
        children: [
          {
            type: 'view',
            children: [
              {
                type: 'label',
                children: [{ type: 'button', text: 'hello', style: {} }],
              },
            ],
          },
        ],
      })
      expect(child.child()).to.be.instanceOf(Component)
      expect(child.child().child()).to.be.instanceOf(Component)
      expect(child.child().child().child()).to.be.instanceOf(Component)
    })

    xit('should convert all of its children to Component instance when creating children with createChild', () => {
      const child = new Component({ type: 'view' })
      child.createChild({
        type: 'view',
        children: [
          {
            type: 'label',
            children: [{ type: 'button', text: 'hello', style: {} }],
          },
        ],
      })
      expect(child.child()).to.be.instanceOf(Component)
      expect(child.child().child()).to.be.instanceOf(Component)
      expect(child.child().child().child()).to.be.instanceOf(Component)
    })

    it('should be able to get the listItem instance from any of its children down its tree', () => {
      const targetChild = new Component({
        type: 'label',
        style: { color: '0x000000ff' },
        dataKey: 'abcccccccc',
      })
      const child1 = component.createChild({
        type: 'list',
        contentType: 'listObject',
        iteratorVar: 'itemObject',
        listObject: [
          {
            title: 'hello this is my title',
            fruits: ['apple', 'orange'],
            vegetables: ['carrot', 'tomatoes'],
          },
          {
            title: 'hello this is my title#2',
            fruits: ['apple', 'plum'],
            vegetables: ['cilantro', 'spinach'],
          },
        ],
      })
      const child1child = child1.createChild({
        type: 'listItem',
        dataKey: 'loppoo',
        itemObject: '',
        onClick: [
          {
            actionType: 'updateObject',
            dataKey: 'Global.VideoChatObjStore.reference.edge',
            dataObject: 'itemObject',
          },
          {
            actionType: 'pageJump',
            destination: 'VideoChat',
          },
        ],
        style: {
          borderWidth: '1',
          borderColor: '0x00000011',
        },
      })
      child1child.createChild({
        type: 'label',
        dataKey: 'itemObject.name.hostName',
      })
      child1child.createChild({
        type: 'label',
        dataKey: 'itemObject.name.roomName',
        style: { color: '0x000000ff' },
      })
      const parentOfTargetChild = child1child.createChild({
        type: 'view',
        dataKey: 'itemObject.name.roomName',
        style: { color: '0x000000ff' },
      })
      child1child.createChild({
        type: 'image',
        path: 'rightArrow.png',
        style: { left: '0.88' },
      })
      const expectedChild = parentOfTargetChild.createChild({
        type: 'view',
        style: {},
      })
      expectedChild.createChild(targetChild)
      const expectedResult = targetChild.parent().parent().parent()
      expect(expectedResult).to.equal(child1child)
    })
  })
})
