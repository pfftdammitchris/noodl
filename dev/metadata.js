const u = require('@jsmanifest/utils')
const fs = require('fs-extra')
const path = require('path')
const y = require('yaml')
const { createMetadataExtractor, is } = require('noodl-metadata')

const keyType = {}

function register(opts) {
  return function createPlugin(name) {
    return function plugin(node) {
      //
    }
  }
}

const plugins = {
  component: register({
    keys: {
      type: {
        type: 'String',
      },
    },
  }),
}

u.entries(plugins).forEach(([name, createPlugin]) => {
  const plugin = createPlugin(name)
})

const extractor = createMetadataExtractor({
  loglevel: 'debug',
  plugins: [
    /**
     * Action types
     */
    {
      init: (store) => {
        store.data.actionTypes = []
      },
      Pair: [
        ({ node, store }) => {
          if (is.pair.key.eq(node, 'actionType')) {
            const actionType = String(node.value)
            if (!store.data.actionTypes.includes(actionType)) {
              store.data.actionTypes.push(actionType)
            }
          }
        },
      ],
    },
    /**
     * Component types
     */
    {
      init: (store) => {
        store.data.builtInEval = {}
        store.data.componentTypes = []
      },
      Map: [
        ({ node, store }) => {
          if (
            is.map.has.allKeys(node, 'type') &&
            is.map.has.anyKey(node, 'children', 'style')
          ) {
            const componentType = node.get('type', false)
            if (!store.data.componentTypes.includes(componentType)) {
              store.data.componentTypes.push(componentType)
            }
          } else if (is.map.single(node)) {
            const pair = node.items[0]
            if (is.pair.key.startsWith(pair, '=.builtIn')) {
              const builtInKey = pair.key.value
              if (!store.data.builtInEval[builtInKey]) {
                store.data.builtInEval[builtInKey] = []
              }
              store.data.builtInEval[builtInKey].push(pair.value)
            }
          }
        },
      ],
    },
  ],
})

const yml = fs.readFileSync(
  path.join(__dirname, '../generated/meetd2/SignIn.yml'),
  'utf8',
)

const doc = y.parseDocument(yml)

extractor
  .extract(doc)
  .then(() => {
    console.log(extractor.store)
    console.log(`${u.cyan('Done!')}`)
  })
  .catch((error) => {
    const err = error instanceof Error ? error : new Error(String(error))
    throw err
  })
