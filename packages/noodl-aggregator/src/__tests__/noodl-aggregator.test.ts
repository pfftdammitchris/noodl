import { expect } from 'chai'
import * as com from 'noodl-common'
import fs from 'fs-extra'
import path from 'path'
import nock from 'nock'
import yaml from 'yaml'
import Aggregator from '../noodl-aggregator.js'
import * as c from '../constants.js'

const cadlEndpointYml = fs.readFileSync(
	path.join(__dirname, './fixtures/cadlEndpoint.yml'),
	'utf8',
)

const meet4dYml = fs.readFileSync(
	path.join(__dirname, './fixtures/meet4d.yml'),
	'utf8',
)

const pathToFixtures = path.join(__dirname, './fixtures')
const cadlEndpointDoc = yaml.parseDocument(cadlEndpointYml)
const preloadPages = (
	cadlEndpointDoc.get('preload') as yaml.YAMLSeq
).toJSON() as string[]
const pages = (cadlEndpointDoc.get('page') as yaml.YAMLSeq).toJSON() as string[]
const data = com.loadFiles(pathToFixtures, { as: 'object' })

const mockAllPageRequests = (_aggregator = aggregator) => {
	for (let page of [...preloadPages, ...pages] as string[]) {
		page.startsWith('~/') && (page = page.replace('~/', ''))
		nock(baseUrl).get(`/${page}_en.yml`).reply(200, data[page])
	}
}

let aggregator: Aggregator<any, any>
let assetsUrl = `https://public.aitmed.com/cadl/meet3_0.45d/assets/`
let baseConfigUrl = `https://${c.DEFAULT_CONFIG_HOSTNAME}/config`
let baseUrl = `https://public.aitmed.com/cadl/meet3_0.45d/`

beforeEach(() => {
	aggregator = new Aggregator('meet4d')
	nock(baseConfigUrl).get('/meet4d.yml').reply(200, meet4dYml)
	nock(baseUrl).get('/cadlEndpoint.yml').reply(200, cadlEndpointYml)
})

afterEach(() => {
	nock.cleanAll()
})

const init = async (_aggregator = aggregator) =>
	_aggregator.init({ loadPages: false, loadPreloadPages: false })

describe(com.coolGold(`noodl-aggregator`), () => {
	describe(com.italic(`init`), () => {
		it(`should initiate both the root config and app config`, async () => {
			const { doc } = await init()
			expect(doc.root?.has('cadlMain')).to.be.true
			expect(doc.app?.has('preload')).to.be.true
			expect(doc.app?.has('page')).to.be.true
		})

		it(`should be able to get the assets url`, async () => {
			expect(aggregator.assetsUrl).not.to.eq(assetsUrl)
			await init()
			expect(aggregator.assetsUrl).to.eq(assetsUrl)
		})

		it(`should be able to get the baseUrl`, async () => {
			expect(aggregator.baseUrl).not.to.eq(baseUrl)
			await init()
			expect(aggregator.baseUrl).to.eq(baseUrl)
		})

		it(`should be able to get the config version (latest)`, async () => {
			expect(aggregator.configVersion).to.eq('')
			await init()
			expect(aggregator.configVersion).to.eq('0.45d')
		})

		it(`should be able to get the app config url`, async () => {
			expect(aggregator.appConfigUrl).to.eq('')
			await init()
			expect(aggregator.configVersion).to.eq('0.45d')
		})

		it(`should load all the preload pages by default`, async () => {
			for (const name of preloadPages) {
				nock(baseUrl)
					.get(new RegExp(name as string, 'gi'))
					.reply(
						200,
						`
					${name}:
						VoidObj: vVoOiIdD
						Style:
							top: '0'
					`,
					)
			}
			await aggregator.init({ loadPages: false })
			preloadPages.forEach((preloadPage) => {
				expect(aggregator.root.get(preloadPage as string)).to.exist
			})
		})

		it(`should load all the pages by default`, async () => {
			mockAllPageRequests()
			await aggregator.init({ loadPreloadPages: false })
			pages.forEach(
				(page: string) =>
					expect(aggregator.root.get(page.replace('~/', ''))).to.exist,
			)
		})
	})

	describe(com.italic(`extractAssets`), () => {
		it(`should extract the assets`, async () => {
			mockAllPageRequests()
			await aggregator.init()
			const assetsUrl = aggregator.assetsUrl
			const assets = aggregator.extractAssets()
			expect(assets).to.have.length.greaterThan(0)
			for (const asset of assets) {
				expect(asset).to.have.property(
					'url',
					`${assetsUrl}${asset.filename}${asset.ext}`,
				)
			}
		})
	})
})
