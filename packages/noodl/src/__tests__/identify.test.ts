import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import * as i from '../utils/identify'
import y from 'yaml'
import createNode from '../utils/createNode'
import typeOf from '../utils/typeOf'

describe(`identify`, () => {
  it(`[isActionTypeStr] should return true`, () => {
    expect(i.isActionTypeStr(new y.Scalar('actionType'))).to.be.true
  })

  it(`[isActionTypeStr] should return false`, () => {
    expect(i.isActionTypeStr(new y.Scalar('actifonType'))).to.be.false
  })

  for (const [fnName, keys] of [
    ['isActionObject', 'actionType'],
    ['isComponentObject', 'type'],
    ['isPageObject', 'components'],
    ['isGotoObject', 'goto'],
    ['isEmitObject', 'emit'],
    ['isApiObject', ['api', 'dataIn']],
  ] as const) {
    it(`[${fnName}] should return true if has key(s) "${u
      .array(keys)
      .join(', ')}"`, () => {
      const obj = {} as Record<string, any>
      u.array(keys).forEach((key) => (obj[key as string] = ''))
      expect(i[fnName](createNode(obj))).to.be.true
    })

    it(`[${fnName}] should return false otherwise`, () => {
      u.array(keys).forEach((key) => {
        expect(i[fnName](createNode({ [`${key}ax`]: '' }))).to.be.false
      })
    })
  }
})

describe(`hasTwoOrMoreKeys`, () => {
  it(`should return true`, () => {
    expect(i.hasTwoOrMoreKeys({ fruit: '', apple: '' }, 'fruit', 'apple')).to.be
      .true
  })
  it(`should return false`, () => {
    expect(i.hasTwoOrMoreKeys({ fruit: '', afpple: '' }, 'fruit', 'apple')).to
      .be.false
  })
  it(`should return false`, () => {
    expect(i.hasTwoOrMoreKeys({ fruit: '', apple: '' }, 'frufit', 'apple')).to
      .be.false
  })
  it(`should return false`, () => {
    expect(i.hasTwoOrMoreKeys({ fruit: '', apple: '' }, '', '')).to.be.false
  })
})

describe(`isObjectContaining`, () => {
  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        {
          actionType: 'evalObject',
          object: new i.KeyQuery({ type: 'array' }),
        },
        createNode({ actionType: 'evalObject', object: [{}, {}] }),
      ),
    ).to.be.true
  })

  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        {
          actionType: 'evalObject',
          object: new i.KeyQuery(['array']),
        },
        createNode({ actionType: 'evalObject', object: [{}, {}] }),
      ),
    ).to.be.true
  })

  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        {
          actionType: 'evalObject',
          object: new i.KeyQuery(['string']),
        },
        createNode({ actionType: 'evalObject', object: '' }),
      ),
    ).to.be.true
  })

  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        {
          actionType: 'evalObject',
          object: new i.KeyQuery({ type: 'null' }),
        },
        createNode({ actionType: 'evalObject', object: null }),
      ),
    ).to.be.true
  })

  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        {
          actionType: 'evalObject',
          object: new i.KeyQuery({ type: 'null' }),
        },
        createNode({ actionType: 'evalObject', object: undefined }),
      ),
    ).to.be.true
  })

  it(`should return true`, () => {
    expect(
      i.isObjectContaining(
        { actionType: 'evalObject' },
        createNode({ actionType: 'evalObject', object: [{}, {}] }),
      ),
    ).to.be.true
  })

  it(`should return false`, () => {
    expect(
      i.isObjectContaining(
        { actionType: 'evalObject' },
        createNode({ actionType: 'evalObjfect', object: [{}, {}] }),
      ),
    ).to.be.false
  })

  it(`should return false`, () => {
    expect(
      i.isObjectContaining(
        { actionType: '' },
        createNode({ actionType: 'evalObjfect', object: [{}, {}] }),
      ),
    ).to.be.false
  })
})
