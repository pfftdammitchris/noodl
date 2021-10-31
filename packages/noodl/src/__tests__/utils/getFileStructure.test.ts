import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import getFileStructure from '../../utils/getFileStructure'

describe(`getFileStructure`, () => {
	const filepath =
		'/Users/christ/ecos/aitmed/ecos/v1beta1/EcosAPI/ce-request.json'

	describe(filepath, () => {
		const result = getFileStructure(filepath)

		it(`should set the ext to .mk4`, () => {
			expect(result).to.have.property('ext', '.json')
		})

		it(`should set filename to ce-request`, () => {
			expect(result).to.have.property('filename', 'ce-request')
		})

		it(`should set filepath to ${filepath}`, () => {
			expect(result).to.have.property('filepath', filepath)
		})

		it(`should set dir to /Users/christ/ecos/aitmed/ecos/v1beta1/EcosAPI`, () => {
			expect(result).to.have.property(
				'dir',
				`/Users/christ/ecos/aitmed/ecos/v1beta1/EcosAPI`,
			)
		})

		it(`should set group to document`, () => {
			expect(result).to.have.property('group', 'document')
		})

		it(`should set the rootDir`, () => {
			expect(result).to.have.property('rootDir', '/')
		})
	})
})
