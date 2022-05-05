import * as u from '@jsmanifest/utils'
import path from 'path'
import { expect } from 'chai'
import * as nu from 'noodl-utils'
import y from 'yaml'
import nock from 'nock'
import sinon from 'sinon'
import { loadFile } from '../noodl'
import { parse as parseYml, toDocument } from '../utils/yml'
import Extractor from '../Extractor'
import ObjAccumulator from '../ObjAccumulator'
import DocIterator from '../DocIterator'
import DocVisitor from '../DocVisitor'
import ObjVisitor from '../ObjVisitor'
import FileStructure from '../FileStructure'
import LinkStructure from '../LinkStructure'
import { ui } from './test-utils'
import * as t from '../types'

const assetsUrl = `https://public.aitmed.com/cadl/meet/v0.13/assets/`
const getRoot = () => ({
  Cereal: {
    formData: {
      user: {
        firstName: `Bob`,
        nicknames: [`Pizza Guy`, `Tooler`, `Framer`],
        videoUrls: [
          {
            name: 'backpack',
            path: 'backpack.mp4',
            related: ['reindeer.mkv'],
          },
        ],
      },
    },
  },
  Tiger: {
    currentImageName: 'event.gif',
    components: [
      ui.view({
        children: [
          ui.label({ dataKey: `Cereal.formData.user.firstName` }),
          ui.list({
            children: [
              ui.listItem({
                children: [
                  ui.divider(),
                  ui.label(`...currentImageName`),
                  ui.button({ text: 'Get ticket' }),
                ],
              }),
            ],
          }),
          ui.image({ path: 'abc.png' }),
          ui.view({
            children: [
              ui.view({ children: [ui.video({ path: 'movie.mkv' })] }),
            ],
          }),
        ],
      }),
    ],
  },
})

// import getFileStructure from '../utils/getFileStructure'
// import getLinkStructure from '../utils/getLinkStructure'

describe.only(`Extractor`, () => {
  describe(`doc`, () => {
    it(
      `should be able to collect all assets using the DocIterator, ` +
        `DocVisitor, FileStructure, LinkStructure, and ObjAccumulator`,
      () => {
        const extractor = new Extractor<any, t.YAMLNode>()

        extractor.use(new DocIterator())
        extractor.use(new DocVisitor())
        extractor.use(new FileStructure())
        extractor.use(new LinkStructure())
        extractor.use(new ObjAccumulator())

        const root = getRoot()
        const data = u
          .entries(root)
          .reduce(
            (acc, [name, obj]) => u.assign(acc, { [name]: toDocument(obj) }),
            {} as Record<string, any>,
          )

        const assets = extractor.extract(data)
        const filepaths = u
          .values(assets)
          .reduce((acc, asset) => acc.concat(asset.map(({ name }) => name)), [])

        expect(filepaths).to.have.all.members([
          'backpack',
          'reindeer',
          'event',
          'abc',
          'movie',
        ])
      },
    )

    xit(`should only collect links if only LinkStructure is used`, () => {
      const extractor = new Extractor<any, t.YAMLNode>()

      extractor.use(new DocIterator())
      extractor.use(new DocVisitor())
      extractor.use(new LinkStructure())

      const root = getRoot()
      const data = u
        .entries(root)
        .reduce(
          (acc, [name, obj]) => u.assign(acc, { [name]: toDocument(obj) }),
          {} as Record<string, any>,
        )

      const assetChunks = extractor.extract(data)
      const filepaths = assetChunks.reduce(
        (acc: string[], chunk: any[]) =>
          acc.concat(chunk.map((asset) => asset.filepath)),
        [],
      )
      console.log(filepaths)

      // expect(filepaths).to.have.all.members([
      //   'backpack.mp4',
      //   'reindeer.mkv',
      //   'event.gif',
      //   'abc.png',
      //   'movie.mkv',
      // ])
    })
  })

  describe(`accumulators`, () => {
    describe(`ObjAccumulator`, () => {
      it(`[init] should reset its value to an empty object`, () => {
        const acc = new ObjAccumulator()
        acc.value = []
        expect(acc.value).to.deep.eq([])
        acc.init()
        expect(acc.value).to.deep.eq({})
      })

      it(`[reduce] should set the name as key and result as its value`, () => {
        const acc = new ObjAccumulator()
        const obj = acc.init()
        acc.reduce(obj, 'hello', 'topo')
        expect(acc.value).to.deep.eq({ hello: 'topo' })
      })
    })
  })

  describe(`iterators`, () => {
    describe(`DocIterator`, () => {
      const getData = () => ({
        hello: new y.Scalar('hehe'),
        fruits: new y.YAMLSeq(),
      })

      it(`[getItems] should return as entries`, () => {
        const iter = new DocIterator()
        expect(iter.getItems(getData())).to.deep.eq([
          ['hello', new y.Scalar('hehe')],
          ['fruits', new y.YAMLSeq()],
        ])
      })

      it(`[getIterator] should return an iterator that we can use with Symbol.iterator`, () => {
        const spy = sinon.spy()
        const iter = new DocIterator()
        const data = getData()
        const keys = u.keys(data)
        const iterator = iter.getIterator(iter.getItems(data))
        const obj = { [Symbol.iterator]: () => iterator }
        ;[...obj].forEach(spy)
        expect(keys).to.deep.eq(['hello', 'fruits'])
        expect(keys).to.have.lengthOf(2)
        expect(spy.firstCall.args[0][1]).to.deep.eq(data.hello)
        expect(spy.secondCall.args[0][1]).to.deep.eq(data.fruits)
      })
    })
  })

  describe(`structures`, () => {
    describe(`FileStructure`, () => {
      it(`should attach the expected properties`, () => {
        const fileStructure = new FileStructure()
        expect(fileStructure.createStructure('')).to.have.all.keys(
          'name',
          'raw',
          'ext',
          'dir',
          'filepath',
          'group',
          'rootDir',
        )
      })

      const commonNullProps = { dir: null, filepath: null, rootDir: null }

      const tests = {
        'hello.mp4': {
          raw: 'hello.mp4',
          ext: 'mp4',
          group: 'video',
          ...commonNullProps,
        },
        hello: {
          raw: 'hello',
          ext: null,
          group: 'unknown',
          ...commonNullProps,
        },
        '.mp4': {
          raw: '.mp4',
          ext: 'mp4',
          group: 'video',
          ...commonNullProps,
        },
        '/Users/christ/aitmed/config/myvideo.avi': {
          raw: '/Users/christ/aitmed/config/myvideo.avi',
          ext: 'avi',
          group: 'video',
          dir: `/Users/christ/aitmed/config`,
          filepath: `/Users/christ/aitmed/config/myvideo.avi`,
          rootDir: `/`,
        },
        '/Users/christ/aitmed/config/myvideo': {
          raw: '/Users/christ/aitmed/config/myvideo',
          ext: null,
          group: 'unknown',
          dir: `/Users/christ/aitmed/config`,
          filepath: `/Users/christ/aitmed/config/myvideo`,
          rootDir: `/`,
        },
        '/Users/christ/aitmed/config/myvideo/': {
          raw: '/Users/christ/aitmed/config/myvideo/',
          ext: null,
          group: 'unknown',
          dir: `/Users/christ/aitmed/config`,
          filepath: `/Users/christ/aitmed/config/myvideo`,
          rootDir: `/`,
        },
        '/Users/christ/aitmed/config/.mp4': {
          raw: '/Users/christ/aitmed/config/.mp4',
          ext: 'mp4',
          group: 'video',
          dir: `/Users/christ/aitmed/config`,
          filepath: `/Users/christ/aitmed/config/.mp4`,
          rootDir: `/`,
        },
      }

      for (const [value, result] of u.entries(tests)) {
        it(`should attach the expected file structure props for "${value}"`, () => {
          const fileStructure = new FileStructure()
          const structure = fileStructure.createStructure(value)
          u.keys(result).forEach((key) =>
            expect(structure).to.have.property(key, result[key]),
          )
        })
      }
    })

    describe.only(`LinkStructure`, () => {
      const commonNullProps = { isRemote: null, url: null }

      const tests = {
        'hello.mp4': {
          raw: 'hello.mp4',
          ext: 'mp4',
          group: 'video',
          ...commonNullProps,
        },
        hello: {
          raw: 'hello',
          ext: null,
          group: 'unknown',
          ...commonNullProps,
        },
        '.mp4': {
          raw: '.mp4',
          ext: 'mp4',
          group: 'video',
          ...commonNullProps,
        },
        '/Users/christ/aitmed/config/myvideo.avi': {
          raw: '/Users/christ/aitmed/config/myvideo.avi',
          ext: 'avi',
          group: 'video',
          isRemote: false,
          url: null,
        },
        '/Users/christ/aitmed/config/myvideo': {
          raw: '/Users/christ/aitmed/config/myvideo',
          ext: null,
          group: 'unknown',
          isRemote: false,
          url: null,
        },
        '/Users/christ/aitmed/config/myvideo/': {
          raw: '/Users/christ/aitmed/config/myvideo/',
          ext: null,
          group: 'unknown',
          isRemote: false,
          url: null,
        },
        '/Users/christ/aitmed/config/.mp4': {
          raw: '/Users/christ/aitmed/config/.mp4',
          ext: 'mp4',
          group: 'video',
          isRemote: false,
          url: null,
        },
        // 'http': {},
        // 'https': {},
        // 'https://': {},
        // 'www': {},
        // 'https://google.com/': {},
        // 'https://google.com/bob': {},
        // 'https://google.com/bob.jpg': {},
        // 'https://google.com/bob.png': {},
        // 'https://google.com/bob/bob.js': {},
        // 'https://google.com/bob/abc.js.html': {},
      }

      for (const [value, result] of u.entries(tests)) {
        it(`should attach the expected file structure props for "${value}"`, () => {
          const linkStructure = new LinkStructure()
          const structure = linkStructure.createStructure(value)
          u.keys(result).forEach((key) =>
            expect(structure).to.have.property(key, result[key]),
          )
        })
      }

      xit(`should return the link structure for ""`, () => {
        //
      })
    })
  })

  describe(`visitors`, () => {
    describe(`DocVisitor`, () => {
      xit(``, () => {
        //
      })
    })
  })
})
