import chalk from 'chalk'
import { expect } from 'chai'
import { PageJumpActionObject } from 'noodl-types'
import Action from '../Action'

let action: Action<PageJumpActionObject>
let pageJump: PageJumpActionObject

beforeEach(() => {
  pageJump = { actionType: 'pageJump', destination: 'SignIn' }
  action = new Action('onClick', pageJump)
})

describe('Action', () => {
  describe('Executing', () => {
    it('should reset the result/error state to their default values', () => {
      const err = new Error('fsdfd')
      action.error = err
      action.result = 'abc'
      expect(action.error).to.equal(err)
      expect(action.result).to.equal('abc')
      action.execute()
      expect(action.error).to.be.null
      expect(action.result).to.be.undefined
    })

    it(`should set status to ${chalk.magenta(
      'resolved',
    )} if the execution was successful`, async () => {
      action.executor = async () => 'abc'
      expect(action.execute()).to.eventually.eq('resolved')
    })
  })

  describe('When failing', () => {
    it('should set the error property to the error if the execution failed', async () => {
      action.executor = async () => {
        throw new Error('abc')
      }
      try {
        await action.execute()
      } catch (error) {
        expect(action.status).to.eq('error')
        expect(action.error).to.eq(error)
      }
    })
  })

  it('should set status to resolved if the execution was a success (async)', async () => {
    action.executor = async () => 'abc'
    await action.execute({ abc: 'letters' })
    expect(action.status).to.eq('resolved')
  })
})
