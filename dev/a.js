const u = require('@jsmanifest/utils')
const fs = require('fs-extra')
const path = require('path')
const y = require('yaml')
const fg = require('fast-glob')
const n = require('noodl')
const {
  createMetadataExtractor,
  defaultPlugins,
  getValidatorFactory,
  Validator,
  KeyValidator,
  ValueValidator,
  is,
} = require('noodl-metadata')

const {
  DocIterator,
  DocVisitor,
  Extractor,
  loadFile,
  FileStructure,
  LinkStructure,
  ObjAccumulator,
  toDocument,
} = n

async function loadDir(dir) {
  const docs = {}
  await Promise.all(
    (
      await fg([dir], { onlyFiles: true, objectMode: true })
    ).map((entry) => {
      if (entry.name.endsWith('.yml')) {
        docs[entry.name] = loadFile(entry.path, 'doc')
      }
    }, {}),
  )
  return docs
}

const extractor = new Extractor()
const docIter = new DocIterator()
const docVisitor = new DocVisitor()
const objAccumulator = new ObjAccumulator()

const metadataExtractor = createMetadataExtractor({
  config: 'admind3',
  deviceType: 'web',
  env: 'stable',
  loglevel: 'debug',
  plugins: [defaultPlugins.action, defaultPlugins.component],
  version: 'latest',
})

const validator = getValidatorFactory()

extractor.use(docIter)
extractor.use(docVisitor)
extractor.use(objAccumulator)

docVisitor.use(({ name, key, value, path }) => {
  if (y.isScalar(value) && u.isStr(value.value)) {
    console.log(value.value)
  }
})

//
;(async () => {
  try {
    const pages = await loadDir(
      path.join(process.cwd(), './generated/admind3/*.yml'),
    )

    const actionTypeValidator = new KeyValidator('actionType')
    // const componentTypeValidator = new KeyValidator('type')
    actionTypeValidator.use(({ value }) => {
      if (
        y.isPair(value) &&
        y.isScalar(value.key) &&
        value.key === 'actionType'
      ) {
        if (y.isMap(value.value)) {
          const action = value.value
          console.log(action)
          if (action.has('funcName')) {
            if (action.get('funcName') !== 'hello') {
              return {
                type: 'error',
                key: value.key,
                message: `funcName can only be "hello"`,
                value: action.get('funcName'),
              }
            }
          }
        }
      }
    })

    // validator.use(actionTypeValidator)

    // u.values(pages).forEach((value) => {
    //   const results = validator.validate({ value })
    // })

    u.values(pages).forEach((page) => docVisitor.visit(page))

    // const results = extractor.extract(pages)
    // const results = await metadataExtractor.extract()
    // console.log(u.keys(pages))
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.log(err)
    // console.error(`[${u.yellow(err.name)}]: ${u.red(err.message)}`, err.stack)
    // throw err
  }
})()
