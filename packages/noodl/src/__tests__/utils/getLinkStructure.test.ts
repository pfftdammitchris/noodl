import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import getLinkStructure from '../../utils/getLinkStructure'

describe(`getLinkStructure`, () => {
	const theDarkKnightMkv = 'http://www.google.com/movies/TheDarkKnight.mkv'

	describe(theDarkKnightMkv, () => {
		const result = getLinkStructure(theDarkKnightMkv)

		it(`should set the ext to .mk4`, () => {
			expect(result).to.have.property('ext', '.mkv')
		})

		it(`should set filename to TheDarkKnight`, () => {
			expect(result).to.have.property('filename', 'TheDarkKnight')
		})

		it(`should set isRemote to true`, () => {
			expect(result).to.have.property('isRemote').to.eq(true)
		})

		it(`should set url to ${theDarkKnightMkv}`, () => {
			expect(result).to.have.property('url', theDarkKnightMkv)
		})

		it(`should set group to video`, () => {
			expect(result).to.have.property('group', 'video')
		})
	})
})
