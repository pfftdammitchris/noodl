import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import BaseObjects from './BaseObjects'

let base: BaseObjects

beforeEach(() => {
	base = new BaseObjects({
		env: 'test',
		endpoint: 'https://public.aitmed.com/config/meet2d.yml',
	})
})

describe('BaseObjects', async () => {
	describe('init', () => {
		it('should set the root config', () => {
			//
		})
	})
})
