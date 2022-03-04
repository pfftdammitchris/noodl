import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import loadFiles from '../utils/loadFiles'
import * as path from 'path'
import nock from 'nock'
import y from 'yaml'
import NoodlLoader from '../Loader'
import { ensureExt, readFileSync, readJsonSync } from '../utils/fileSystem'
import loadFile from '../utils/loadFile'

const meetd2yml = readFileSync(path.join(__dirname, './fixtures/meetd2.yml'))
const baseCssObject = loadFile(
  path.join(__dirname, './fixtures/BaseCSS.yml'),
  'json',
)

const config = 'meetd2'
const pathToFixtures = path.join(__dirname, './fixtures')

const loadYmlFactory =
  (filename = '') =>
  () =>
    readFileSync(path.join(pathToFixtures, `${ensureExt(filename, 'yml')}`))

const getRootConfigYml = loadYmlFactory(config)
const getAppConfigYml = loadYmlFactory(`cadlEndpoint`)
const toYml = (obj: Record<string, any>) => y.stringify(obj)

const rootConfig = y.parse(getRootConfigYml())
const appConfig = y.parse(getAppConfigYml())
const preloadPages = (appConfig.preload || []) as string[]
const pages = (appConfig.page || []) as string[]
const data = loadFiles(pathToFixtures, { as: 'object' })

const mockAllPageRequests = (_loader = loader) => {
  for (let page of [...preloadPages, ...pages] as string[]) {
    page.startsWith('~/') && (page = page.replace('~/', ''))
    nock(baseUrl).get(new RegExp(page, 'i')).reply(200, data[page])
  }
}

let loader: NoodlLoader<typeof config, 'map'>
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
    describe(`when dataType is map`, () => {
      beforeEach(() => {
        loader = new NoodlLoader({ config: 'meetd2' })
      })

      it(`[map] should initiate both the root config and app config`, async () => {
        await init()
        const cadlEndpoint = loader.root.get('cadlEndpoint') as y.Document
        const cadlMain = loader.root.get(config) as y.Document
        expect(cadlMain.has('cadlMain')).to.be.true
        expect(cadlEndpoint.has('preload')).to.be.true
        expect(cadlEndpoint.has('page')).to.be.true
      })

      it(`[map] should set the root value as a yaml node`, async () => {
        await init()
        expect(y.isDocument(loader.root.get(config) as y.Document)).to.be.true
      })
    })

    describe(`when dataType is object`, () => {
      let loader: NoodlLoader<'meetd2', 'object'>

      beforeEach(() => {
        loader = new NoodlLoader({ config: 'meetd2', dataType: 'object' })
      })

      it(`[object] should initiate both the root config and app config`, async () => {
        await init(loader)
        const cadlEndpoint = loader.root.cadlEndpoint
        const cadlMain = loader.root.meetd2
        expect(cadlMain).to.have.property('cadlMain')
        expect(cadlEndpoint).to.have.property('preload')
        expect(cadlEndpoint).to.have.property('page')
      })

      it(`[object] should set root/app config as plain objects`, async () => {
        await loader.init({ dir: pathToFixtures })
        for (const node of u.values(loader.root)) {
          expect(y.isNode(node)).to.be.false
          expect(y.isDocument(node)).to.be.false
          expect(y.isPair(node)).to.be.false
          expect(y.isAlias(node)).to.be.false
          expect(u.isObj(node)).to.be.true
        }
      })

      it(`[object] should return the parsed appConfigUrl`, async () => {
        const loader = new NoodlLoader({ config: 'meetd2', dataType: 'object' })
        await loader.loadRootConfig({
          ...rootConfig,
          cadlBaseUrl:
            'https://public.aitmed.com/cadl/meet3_${cadlVersion}${designSuffix}/',
        })
        expect(loader.appConfigUrl).to.eq(
          `https://public.aitmed.com/cadl/meet3_${rootConfig?.web?.cadlVersion?.test}/${loader.appKey}.yml`,
        )
      })

      describe(`when loading preload pages`, () => {
        it(`[object] should load each key of preload object as plain objects when using spread`, async () => {
          mockAllPageRequests()
          await loader.init({
            dir: pathToFixtures,
            loadPages: false,
            loadPreloadPages: true,
            spread: ['BaseCSS'],
          })
          const obj = baseCssObject
          const keys = u.keys(obj)
          expect(keys).to.have.length.greaterThan(0)
          keys.forEach((key) => {
            const value = obj[key]
            expect(y.isNode(value)).to.be.false
            expect(y.isDocument(value)).to.be.false
            expect(y.isPair(value)).to.be.false
            expect(y.isAlias(value)).to.be.false
            expect(u.isObj(obj)).to.be.true
          })
        })

        it(`[object] should not spread keys of objects when it is not in "spread"`, async () => {
          mockAllPageRequests()
          await loader.init({
            dir: pathToFixtures,
            loadPages: false,
            loadPreloadPages: true,
            spread: ['BaseCSS'],
          })
          for (const [name, obj] of u.entries(
            u.pick(
              loader.root,
              preloadPages.filter((s) => s !== 'BaseCSS'),
            ),
          )) {
            expect(loader.root).to.have.property(name)
            u.keys(obj).forEach((key) => {
              if (/global/i.test(key as string)) return
              expect(loader.root).not.to.have.property(key as any)
            })
          }
        })
      })

      describe(`when loading app pages`, () => {
        it(`[object] should load each page as a plain object`, async () => {
          mockAllPageRequests()
          await loader.init({
            dir: pathToFixtures,
            loadPages: true,
            loadPreloadPages: true,
          })
          for (const [name, obj] of u.entries(u.pick(loader.root, pages))) {
            const pageObject = loader.root[name]
            expect(y.isNode(pageObject)).to.be.false
            expect(y.isDocument(pageObject)).to.be.false
            expect(y.isPair(pageObject)).to.be.false
            expect(y.isAlias(pageObject)).to.be.false
            expect(u.isObj(obj)).to.be.true
          }
        })

        it(`[object] should be able to retrieve their objects using getInRoot`, async () => {
          mockAllPageRequests()
          await loader.init({
            dir: pathToFixtures,
            loadPages: true,
            loadPreloadPages: false,
          })
          pages.forEach((page) => {
            const value = loader.getInRoot(page)
            expect(value).to.exist
            expect(value).to.be.an('object')
          })
        })
      })

      it(`[object] should resolve/return the assetsUrl`, async () => {
        const loader = new NoodlLoader({
          config: 'meetd2',
          dataType: 'object',
        })
        mockAllPageRequests()
        expect(loader.assetsUrl).not.to.eq(assetsUrl)
        await loader.loadRootConfig({ config: 'meetd2', dir: pathToFixtures })
        expect(loader.assetsUrl).to.eq(assetsUrl)
      })

      describe(`when extracting assets`, () => {
        it(`should be able to extract assets`, async () => {
          mockAllPageRequests()
          const loader = new NoodlLoader({
            config: 'meetd2',
            dataType: 'object',
          })
          await loader.init({
            dir: pathToFixtures,
            loadPages: true,
            loadPreloadPages: true,
          })
          const assets = await loader.extractAssets()
          expect(assets).to.have.length.greaterThan(0)
          assets.forEach((asset) => {
            expect(asset).to.have.property('group').to.exist
          })
        })
      })
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
      const pages = (
        (loader.root.get('cadlEndpoint') as y.Document).get('page') as y.YAMLSeq
      ).toJSON()
      expect(pages).to.have.length.greaterThan(0)
      pages.forEach((page: string) => {
        expect(loader.root.get(page.replace('~/', ''))).to.exist
      })
    })
  })

  describe(u.italic(`extractAssets`), () => {
    let remoteBaseUrl = 'https://public.aitmed.com/cadl/meet3_${cadlVersion}/'

    beforeEach(async () => {
      nock(`https://public.aitmed.com/config`)
        .get('/meetd2.yml')
        .reply(
          200,
          y.stringify({
            ...y.parse(meetd2yml),
            cadlBaseUrl: remoteBaseUrl,
          }),
        )
      await loader.init({ dir: pathToFixtures })
    })

    it(`should extract the assets`, async () => {
      const assets = await loader.extractAssets()
      expect(assets).to.have.length.greaterThan(0)
      for (const asset of assets) {
        expect(asset).to.have.property('url').to.be.a('string')
        expect(asset.url.startsWith('http')).to.be.true
      }
    })

    it(`should set isRemote to false when assets is relative to the app's baseUrl`, async () => {
      const assets = await loader.extractAssets()
      for (const asset of assets) {
        if (!asset.raw.startsWith('http')) {
          expect(asset.isRemote).to.be.false
        } else {
          expect(asset.isRemote).to.be.true
        }
      }
    })

    it(`should set the url to be the remote url if isRemote is false (relative to app's baseUrl)`, async () => {
      const assets = await loader.extractAssets()
      for (const asset of assets) {
        if (!asset.isRemote) {
          expect(/(127.0.0.1|localhost)/.test(asset.url)).to.be.false
          expect(/public.aitmed.com/.test(asset.url)).to.be.true
        }
      }
    })
  })

  it(`[map] should set values of root properties as y nodes`, async () => {
    await loader.init({ dir: pathToFixtures })
    for (const node of loader.root.values()) {
      expect(y.isNode(node) || y.isDocument(node)).to.be.true
    }
  })
})
