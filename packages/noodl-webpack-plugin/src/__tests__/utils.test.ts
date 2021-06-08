import curry from 'lodash/curry'
import { coolGold, italic, magenta } from 'noodl-common'
import { expect } from 'chai'
import * as com from '../utils'

describe(coolGold(`utils`), () => {
	describe(italic(`createPlaceholderReplacers`), () => {
		it(`should compose replacers and still generate the expected output`, () => {
			const cadlVersion = '0.201'
			const cadlBaseUrl = 'https://google.com'
			const replacer = com.createPlaceholderReplacers(
				[
					['${cadlBaseUrl}', cadlBaseUrl],
					['~/', ''],
					['${cadlVersion}', cadlVersion],
				],
				'g',
			)
			expect(
				replacer(
					JSON.stringify({
						cadlBaseUrl: 'https://public.aitmed.com/cadl/meet2_${cadlVersion}/',
						baseUrl: '${cadlBaseUrl}',
						assetsUrl: '${cadlBaseUrl}assets/',
						version: { web: { cadlVersion: { stable: '0.1', test: '0.18d' } } },
						url: 'https://fsaasfasfas.com/config/aimed.${cadlVersion}v/',
					}),
				),
			).to.eq(
				JSON.stringify({
					cadlBaseUrl: `https://public.aitmed.com/cadl/meet2_${cadlVersion}/`,
					baseUrl: cadlBaseUrl,
					assetsUrl: `${cadlBaseUrl}assets/`,
					version: { web: { cadlVersion: { stable: '0.1', test: '0.18d' } } },
					url: `https://fsaasfasfas.com/config/aimed.${cadlVersion}v/`,
				}),
			)
		})
	})

	describe(italic(`createPlaceholderReplacer`), () => {
		const getReplacerResults = curry(
			(placeholder: string, str: string, value: any) => {
				const replacer = com.createPlaceholderReplacer(placeholder, 'g')
				return replacer(str, value)
			},
		)

		it(`should create a function that replaces placeholders`, () => {
			const getTempStr = (s: any) => `abc${s}mkdmk2;km`
			expect(
				getReplacerResults(
					'${cadlBaseUrl}',
					getTempStr('${cadlBaseUrl}'),
					3001,
				),
			).to.eq(getTempStr(3001))
			expect(
				getReplacerResults(
					'${designSuffix}',
					getTempStr('${designSuffix}'),
					3001,
				),
			).to.eq(getTempStr(3001))
			expect(
				getReplacerResults(
					'${cadlVersion}',
					getTempStr('${cadlVersion}'),
					3001,
				),
			).to.eq(getTempStr(3001))
		})
	})
})
