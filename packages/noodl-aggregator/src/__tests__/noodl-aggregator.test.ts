import * as u from '@jsmanifest/utils'
import * as com from 'noodl-common'
import fs from 'fs-extra'
import path from 'path'
import { expect } from 'chai'
import sinon from 'sinon'
import nock from 'nock'
import yaml from 'yaml'
import Aggregator from '../noodl-aggregator'
import * as c from '../constants'

const cadlEndpointYml = fs.readFileSync(
	path.join(__dirname, './fixtures/cadlEndpoint.yml'),
	'utf8',
)
const meet4dYml = fs.readFileSync(
	path.join(__dirname, './fixtures/meet4d.yml'),
	'utf8',
)
const cadlEndpointDoc = yaml.parseDocument(cadlEndpointYml)
const preloadPages = (cadlEndpointDoc.get('preload') as yaml.YAMLSeq).toJSON()
const pages = (cadlEndpointDoc.get('page') as yaml.YAMLSeq).toJSON()

let aggregator: Aggregator
let assetsUrl = `https://public.aitmed.com/cadl/meet3_0.45d/assets`
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
			const { doc } = await aggregator.init({ loadPages: false })
			const appConfig = doc.app?.toJS()

			for (const name of appConfig.preload) {
				nock(baseUrl)
					.get(new RegExp(`\/(${name}|${name}_en).yml`, 'gi'))
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

			preloadPages.forEach((preloadPage) => {
				expect(aggregator.root.get(preloadPage as string)).to.exist
			})

			for (const [name, doc] of aggregator.root) {
				console.log(`${name}`, doc.toJSON?.())
			}
		})

		xit(`should load all the pages by default`, async () => {
			//
		})
	})
})
