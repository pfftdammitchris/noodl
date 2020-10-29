import { expect } from 'chai'
import { createPlaceholderReplacer } from './common'

describe('common (utils)', () => {
	describe('createPlaceholderReplacer', () => {
		it('should replace the string', () => {
			const replace = createPlaceholderReplacer('\\${cadlBaseUrl}')
			expect(replace('abc${cadlBaseUrl}', 'loop')).to.equal(`abcloop`)
		})

		it('should replace all the strings in the obj', () => {
			const replace = createPlaceholderReplacer('\\${cadlBaseUrl}', 'g')
			const obj = {
				web: { version: { hello: 'hello${cadlBaseUrl}' } },
				hello: { something: '${cadlBaseUrl}' },
			}
			const result = replace(obj, 'loop')
			expect(result.web.version.hello).to.equal('helloloop')
			expect(result.hello.something).to.equal('loop')
		})
	})
})
