// @ts-nocheck
import * as u from '@jsmanifest/utils'
import getFileStructure from '../utils/getFileStructure'
import getLinkStructure from '../utils/getLinkStructure'
import NoodlVisitor from '../Visitor'
import { getReferenceNodes } from '../internal/yaml'
import { getRoot } from './test-utils'

describe.skip(`utils`, () => {
  describe.skip(`getFileStructure`, () => {
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
        expect(result).to.have.property('isRemote')
        expect(result.isRemote).toBe(true)
      })

      it(`should set url to ${theDarkKnightMkv}`, () => {
        expect(result).to.have.property('url', theDarkKnightMkv)
      })

      it(`should set group to video`, () => {
        expect(result).to.have.property('group', 'video')
      })
    })
  })

  describe(u.yellow(`Visitor`), () => {
    let root
    let visitor

    let ymls = {
      // AboutAitmed: loadFile(getAbsFilePath('./fixtures/AboutAitmed.yml')),
    }

    beforeEach(() => {
      root = getRoot()
      visitor = new NoodlVisitor()
      visitor.root = root
    })

    it(`visit function`, () => {
      console.log({ ymls })
    })
  })

  describe(u.yellow(`yaml`), () => {
    let root

    beforeEach(() => {
      root = {}
    })

    describe(`getReferenceNodes`, () => {
      it(`should return an array`, () => {
        const refStr = `Tiger.genders.1.value`
        expect(getReferenceNodes(root, refStr)).to.be.instanceOf(Array)
      })

      it(`should have nodes in the result`, () => {
        expect(getReferenceNodes(root, `Tiger.genders.1.value`).length).toBe(0)
      })

      it(`should set the rootKey for each node`, () => {
        const [rootNode, ...rest] = getReferenceNodes(
          root,
          `Tiger.genders.1.value`,
        )
        for (const node of rest) {
          expect(node.rootKey).toBe('Tiger')
        }
      })

      it(`should contain the exact same amount of nodes as the keys in the reference`, () => {
        const refStr = `Tiger.genders.1.value`
        const paths = refStr.split('.')
        const nodes = getReferenceNodes(root, refStr)
        expect(nodes).to.have.length(paths.length)
      })

      it(`should contain the reference nodes in order`, () => {
        const refStr = `Tiger.genders.1.value`
        const paths = refStr.split('.')
        const nodes = getReferenceNodes(root, refStr)

        for (let i = 0; i < nodes.length; i++) {
          expect(nodes[i].value).toBe(paths[i])
        }
      })
    })
  })
})
