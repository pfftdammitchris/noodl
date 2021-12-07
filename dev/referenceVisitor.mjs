// process.stdout.write('\x1Bc')
import fs from 'fs-extra'
import path from 'path'
import n from 'noodl'
import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import nu from 'noodl-utils'
import y, {
  isCollection,
  isDocument,
  isScalar,
  isPair,
  isMap,
  isSeq,
  parse as parseYml,
  parseDocument,
  stringify,
  visit,
} from 'yaml'

/**
 * @typedef { import('yaml').Node } YAMLNode
 * @typedef { import('yaml').YAMLMap } YAMLMap
 * @typedef { import('yaml').YAMLSeq } YAMLSeq
 * @typedef { import('yaml').Document } YAMLDocument
 */

const is = nt.Identify

/** @return { o is YAMLMap | YAMLSeq | YAMLDocument } */
const isGetAble = (o) => isCollection(o) || isDocument(o)

const Cereal = new y.Document({
  formData: {
    email: 'pfftd@gmail.com',
    options: {
      genders: [
        { key: 'gender', value: 'Female' },
        { key: 'gender', value: 'Male' },
        { key: 'gender', value: 'Unknown' },
      ],
    },
  },
})

const Tiger = new y.Document({
  iconName: 'Sun.users.1.email',
})

const Sun = new y.Document({
  users: [{ email: '..info.currentUser.email' }, { email: 'joe@gmail.com' }],
  info: {
    currentUser: {
      email: 'Cereal.formData.email',
      credentials: '..secret.profile.user.auth',
    },
  },
  profile: {
    user: {
      auth: {
        username: 'mike',
        password: 'gonzalez',
      },
    },
  },
  secret: { profile: '..profile' },
})

const Cloud = new y.Document({
  authentication: '.Sun.info.currentUser.credentials',
})

const root = {
  Cereal,
  Cloud,
  Sun,
  Tiger,
}

const reject = (fn, arr = []) => arr.filter((value) => !fn(value))

function get(node, pageName, key) {
  if (u.isNil(key)) return node

  const keyStr = u.isStr(key) ? key : String(key.join('.'))
  const dataPathStr = nu.trimReference(keyStr)
  const dataPaths = nu.toDataPath(dataPathStr)

  if (is.reference(keyStr)) {
    if (is.localReference(keyStr)) {
      return get(root[pageName], pageName, dataPathStr)
    }
    const [rootKey, ...paths] = dataPathStr
    return get(root[rootKey], rootKey, paths)
  }

  return isGetAble(node)
    ? node.get(dataPaths[0])
    : u.isObj(node)
    ? node[dataPaths[0]]
    : node
}

/**
 * Deeply retrieves values of references
 * @param { YAMLNode } node
 * @param { string } pageName
 * @param { string | number | (string | number)[] } key
 * @returns
 */
function getInDeep(node, pageName, key) {
  if (u.isNil(key)) return node

  key = reject(
    u.isNil,
    u.isArr(key) ? key : u.isStr(key) ? key.split('.') : [key],
  )

  if (key.length) {
    const keyStr = String(key.join('.'))
    const dataPathStr = nu.trimReference(keyStr)
    const dataPaths = nu.toDataPath(dataPathStr)
    const isLocal = is.localKey(dataPathStr)
    const isReference = is.reference(keyStr)

    if (isReference) {
      if (isLocal) {
        return getInDeep(root[pageName], pageName, dataPaths)
      }
      const [rootKey, ...paths] = dataPaths
      return getInDeep(root[rootKey], rootKey, paths)
    }

    const nextLookupKey = key.shift()

    if (isGetAble(node)) {
      const value = node.get(nextLookupKey, true)

      if (isGetAble(value)) return getInDeep(value, pageName, key)

      if (isScalar(value)) {
        node = value
        if (u.isStr(node.value)) {
          if (is.reference(node.value)) {
            // .. or .
            if (node.value.startsWith('.')) {
              if (is.localReference(node.value)) {
                return getInDeep(
                  root[pageName],
                  pageName,
                  nu.toDataPath(nu.trimReference(node.value)).concat(key),
                )
              }
              const [rootKey, ...paths] = nu.toDataPath(
                nu.trimReference(node.value),
              )
              return getInDeep(root[rootKey], rootKey, paths.concat(key))
            }
            // =.. or __.
          }
        }
        return node
      }
      return value
    } else if (u.isObj(node)) {
      if (nextLookupKey in node) {
        return getInDeep(node[nextLookupKey], pageName, key)
      }
    }
  }
  return node
}

function getInDeepWithMetadata({ node, pageName, key, path = [] }) {
  if (u.isNil(key)) return { node, pageName, key, path }

  key = reject(
    u.isNil,
    u.isArr(key) ? key : u.isStr(key) ? key.split('.') : [key],
  )

  if (key.length) {
    const rawKeyStr = String(key.join('.'))
    const keyStr = nu.trimReference(rawKeyStr)
    const isReference = is.reference(rawKeyStr)
    const isLocal = isReference
      ? is.localReference(keyStr)
      : is.localKey(keyStr)

    if (isReference) {
      if (isLocal) {
        return getInDeepWithMetadata({
          node: getInDeep(root[pageName], pageName, key),
          isLocal,
          isReference,
          pageName,
          key: keyStr,
          rawKey: rawKeyStr,
          path: path.concat(node),
        })
      }
      const [rootKey, ...paths] = nu.toDataPath(keyStr)
      return getInDeepWithMetadata({
        node: getInDeep(root[rootKey], rootKey, paths),
        pageName: rootKey,
        key: paths,
        isReference,
        isRoot: !isLocal,
        rawKey: rawKeyStr,
        path: path.concat(node),
      })
    }

    const nextLookupKey = key.shift()

    if (isGetAble(node)) {
      const value = node.get(nextLookupKey, true)

      if (isGetAble(value)) {
        return getInDeepWithMetadata({ node: value, pageName, key, path })
      }

      if (isScalar(value)) {
        node = value
        if (u.isStr(node.value)) {
          if (is.reference(node.value)) {
            // .. or .
            if (node.value.startsWith('.')) {
              if (is.localReference(node.value)) {
                const nextNode = root[pageName]
                return getInDeepWithMetadata({
                  node: nextNode,
                  pageName,
                  key: nu.toDataPath(nu.trimReference(node.value)).concat(key),
                  path: path.concat(nextNode),
                })
              }
              const [rootKey, ...paths] = nu.toDataPath(
                nu.trimReference(node.value),
              )
              return getInDeepWithMetadata({
                node: root[rootKey],
                pageName: rootKey,
                key: paths.concat(key),
                path: paths.concat(path),
              })
            }
            // =.. or __.
          }
        }
        return { node }
      }
      return value
    } else if (u.isObj(node)) {
      if (nextLookupKey in node) {
        return getInDeepWithMetadata({
          node: node[nextLookupKey],
          pageName,
          path,
          key,
        })
      }
    }
  }
  return { node }
}

// console.log(getInDeep(root.Cloud, 'Cloud', 'Cloud.authentication')?.toJSON?.())

const loader = new n.Loader({
  config: 'meetd2',
  loglevel: 'debug',
})

;(async () => {
  try {
    await loader.init({
      // dir: n.getAbsFilePath('generated/meetd2'),
      loadPages: true,
      loadPreloadPages: true,
      spread: ['BaseDataModel', 'BaseCSS', 'BasePage', 'BaseMessage'],
    })
    const pathToYmlFile = n.getAbsFilePath('generated/meetd2/Abc.yml')
    const yml = fs.readFileSync(pathToYmlFile, 'utf8')
    const data = new y.Document({}, { logLevel: 'debug', prettyErrors: true })

    loader.setInRoot('Abc', y.parseDocument(yml).get('Abc'))

    for (const [name, doc] of loader.root) {
      const references = new y.YAMLMap()

      if (!data.has(name)) data.set(name, new y.YAMLMap())

      visit(doc, {
        Scalar: (key, node, path) => {
          if (u.isStr(node.value)) {
            if (is.reference(node.value) && node.value.startsWith('.')) {
              let ref = node.value
              let trimmedRef = nu.trimReference(ref)
              let paths = nu.toDataPath(trimmedRef)
              let refNode

              if (is.localReference(ref)) {
                const copyOfPaths = [...paths]
                refNode = doc.getIn(paths, true)
                // console.log(`Encountered local reference: ${ref}`, {
                //   currentPage: name,
                //   rootKey: name,
                //   node: refNode,
                //   paths: copyOfPaths,
                // })
              } else {
                const copyOfPaths = [...paths]
                let rootKey = paths.shift()
                if (rootKey) {
                  refNode = doc.createNode
                    ? doc.createNode(
                        loader.root.get(rootKey)?.getIn(paths, true),
                      )
                    : new y.YAMLMap(
                        loader.root.get(rootKey)?.getIn(paths, true),
                      )
                } else {
                  refNode = node
                }
              }

              if (!u.isNil(refNode)) {
                if (
                  !y.isSeq(doc) &&
                  (y.isDocument(refNode) || y.isMap(refNode))
                ) {
                  if (!references.has(ref)) {
                    references.set(ref, new y.YAMLSeq())
                  }

                  /** @type { y.YAMLSeq } */
                  let refValues = references.get(ref)
                  let refData = new y.YAMLMap()
                  refData.set('reference', ref)
                  refData.set(
                    'path',
                    u.reduce(
                      path,
                      (acc, node, index) => {
                        if (y.isPair(node)) {
                          if (y.isScalar(node.key) && u.isStr(node.key.value)) {
                            if (nt.Identify.reference(node.key.value)) {
                              return acc.concat(node.key)
                            }

                            // console.log(node.key.value)
                          }

                          if (
                            y.isScalar(node.value) &&
                            u.isStr(node.value.value)
                          ) {
                            if (nt.Identify.reference(node.value.value)) {
                              return acc.concat(node.value)
                            }
                          }

                          return acc.concat(node.key)
                        }

                        return acc
                      },
                      [],
                    ),
                  )
                  refData.set('value', refNode.toJSON())
                  refValues.add(refData)
                } else {
                  refNode = doc.createNode?.(refNode)
                }
                return refNode
              }
            }
          }
        },
      })

      if (references.items.length) {
        /** @type { y.YAMLMap } */
        const pageData = data.get(name)

        if (!pageData.has('references')) {
          pageData.set('references', references)
        } else {
          /** @type { y.YAMLMap } */
          const currReferences = pageData.get('references')
          for (const refPair of references.items) {
            currReferences.set(refPair.key, refPair.value)
          }
        }
      }
    }

    await fs.writeJson(
      './abc.json',
      {
        data,
        rootKeys: [...loader.root.keys()],
      },
      {
        spaces: 2,
      },
    )

    console.log(
      `There are ${u.yellow([...loader.root.keys()].length)} keys in root`,
    )
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})()
