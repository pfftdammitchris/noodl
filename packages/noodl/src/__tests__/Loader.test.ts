import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import loadFiles from '../utils/loadFiles'
import * as fs from 'fs-extra'
import * as path from 'path'
import nock from 'nock'
import yaml from 'yaml'
import NoodlLoader from '../Loader'

const meetd2yml = fs.readFileSync(
  path.join(__dirname, './fixtures/meetd2.yml'),
  'utf8',
)

const config = 'meetd2'
const pathToFixtures = path.join(__dirname, './fixtures')

const loadYmlFactory =
  (filename = '') =>
  () =>
    fs.readFileSync(
      path.join(pathToFixtures, `${filename.replace('.yml', '')}.yml`),
      'utf8',
    )

const getRootConfigYml = loadYmlFactory(config)
const getAppConfigYml = loadYmlFactory(`cadlEndpoint`)

const appConfig = yaml.parse(getAppConfigYml())
const preloadPages = (appConfig.preload || []) as string[]
const pages = (appConfig.page || []) as string[]
const data = loadFiles(pathToFixtures, { as: 'object' })

const mockAllPageRequests = (_loader = loader) => {
  for (let page of [...preloadPages, ...pages] as string[]) {
    page.startsWith('~/') && (page = page.replace('~/', ''))
    nock(baseUrl).get(new RegExp(page, 'i')).reply(200, data[page])
  }
}

let loader: NoodlLoader<any, any>
let assetsUrl = `http://127.0.0.1:3001/assets/`
let baseConfigUrl = `http://127.0.0.1:3001/config`
let baseUrl = `http://127.0.0.1:3001/`

beforeEach(() => {
  loader = new NoodlLoader({ config: 'meetd2' })
  nock(baseConfigUrl).get('/meetd2.yml').reply(200, meetd2yml)
  nock(baseUrl).get('/cadlEndpoint.yml').reply(200, getAppConfigYml())
})

afterEach(() => {
  nock.cleanAll()
})

async function init(
  _loader = loader as
    | NoodlLoader
    | ConstructorParameters<typeof NoodlLoader>[0],
) {
  let options: ConstructorParameters<typeof NoodlLoader>[0]
  if (!(_loader instanceof NoodlLoader)) {
    options = _loader
    _loader = new NoodlLoader(options)
  }
  return (_loader as NoodlLoader).init({
    dir: pathToFixtures,
    loadPages: false,
    loadPreloadPages: false,
    ...(u.isObj(options) ? options : { config: options }),
  })
}

describe(u.yellow(`noodl`), () => {
  describe(u.italic(`init`), () => {
    it(`[map] should initiate both the root config and app config`, async () => {
      loader = new NoodlLoader({ config: 'meetd2' })
      const doc = (await init()).doc
      expect(loader.root.get(config).has('cadlMain')).to.be.true
      expect(loader.root.get('cadlEndpoint').has('preload')).to.be.true
      expect(loader.root.get('cadlEndpoint').has('page')).to.be.true
    })

    it(`[object] should initiate both the root config and app config`, async () => {
      const doc = (await init()).doc
      expect(doc.root?.has('cadlMain')).to.be.true
      expect(doc.app?.has('preload')).to.be.true
      expect(doc.app?.has('page')).to.be.true
    })

    it(`should return the assets url`, async () => {
      expect(loader.assetsUrl).not.to.eq(assetsUrl)
      await init()
      expect(loader.assetsUrl).to.eq(assetsUrl)
    })

    it(`should return the baseUrl`, async () => {
      expect(loader.baseUrl).not.to.eq(baseUrl)
      await init()
      expect(loader.baseUrl).to.eq(baseUrl)
    })

    it(`should return the config version (latest)`, async () => {
      expect(loader.configVersion).to.eq('')
      await init()
      expect(loader.configVersion).to.eq('0.7d')
    })

    it(`should return the app config url`, async () => {
      expect(loader.appConfigUrl).to.eq('')
      await init()
      expect(loader.configVersion).to.eq('0.7d')
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
      await loader.init({ dir: pathToFixtures, loadPages: false })
      preloadPages.forEach((preloadPage) => {
        expect(loader.root.get(preloadPage as string)).to.exist
      })
    })

    it(`should load all the pages by default`, async () => {
      await loader.init({ dir: pathToFixtures, loadPreloadPages: false })
      const pages = loader.root.get('cadlEndpoint').get('page').toJSON()
      expect(pages).to.have.length.greaterThan(0)
      pages.forEach((page: string) => {
        expect(loader.root.get(page.replace('~/', ''))).to.exist
      })
    })
  })

  describe(u.italic(`extractAssets`), () => {
    it(`should extract the assets`, async () => {
      mockAllPageRequests()
      await loader.init({ dir: pathToFixtures })
      const assets = loader.extractAssets()
      expect(assets).to.have.length.greaterThan(0)
      for (const asset of assets) {
        expect(asset).to.have.property('url').to.be.a('string')
        expect(asset.url.startsWith('http')).to.be.true
      }
    })
  })
})
