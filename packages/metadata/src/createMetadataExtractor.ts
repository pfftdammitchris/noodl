import y from 'yaml'
import flatten from 'lodash/flatten'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import * as t from './types'
import Store from './Store'

export interface VisitFnParamsObject<N = unknown> {
  key: Parameters<y.visitorFn<N>>[0]
  node: Parameters<y.visitorFn<N>>[1]
  path: Parameters<y.visitorFn<N>>[2]
}

export interface VisitorFn<
  N = unknown,
  Opts extends Record<string, any> = Record<string, any>,
> {
  (args: VisitFnParamsObject<N> & { store: Store } & Opts):
    | ReturnType<y.visitorFn<N>>
    | ReturnType<y.asyncVisitorFn<N>>
}

export interface Plugin {
  key: string
  init?: (store: Store) => void
  any?: VisitorFn<
    unknown,
    {
      type:
        | 'Alias'
        | 'Collection'
        | 'Document'
        | 'Map'
        | 'Seq'
        | 'Pair'
        | 'Scalar'
    }
  >[]
  Alias?: VisitorFn<y.Alias>[]
  Collection?: VisitorFn<y.YAMLMap | y.YAMLSeq>[]
  Map?: VisitorFn<y.YAMLMap>[]
  Node?: VisitorFn<y.Alias | y.Scalar | y.YAMLMap | y.YAMLSeq>[]
  Pair?: VisitorFn<y.Pair>[]
  Scalar?: VisitorFn<y.Scalar>[]
  Seq?: VisitorFn<y.YAMLSeq>[]
}

export interface ExtractOptions {
  config: string
  /** @default 'web' */
  deviceType?: nt.DeviceType
  /** @default 'test' */
  env?: nt.Env
  /** @default 'error' */
  loglevel?: t.LogLevel
  /** @default 'latest' */
  plugins?: Plugin[]
  version?: string
}

function createMetadataExtractor(options?: ExtractOptions) {
  const plugins = options?.plugins || []
  const store = new Store()

  async function extract(nodeProp: y.Node | y.Document.Parsed) {
    plugins.map((plugin) => plugin.init?.(store))

    await y.visitAsync(nodeProp, async function onVisit(key, node, path) {
      const opts: Parameters<VisitorFn>[0] = {
        key,
        node,
        path,
        store,
      }

      const results = flatten(
        await Promise.all(
          plugins.map((plugin) =>
            Promise.all(
              (
                [
                  ['Alias', y.isAlias],
                  ['Collection', y.isCollection],
                  ['Document', y.isDocument],
                  ['Map', y.isMap],
                  ['Seq', y.isSeq],
                  ['Pair', y.isPair],
                  ['Scalar', y.isScalar],
                ] as const
              ).map(async ([type, is]) => {
                const results = [] as (
                  | number
                  | symbol
                  | void
                  | y.Node
                  | y.Pair<unknown, unknown>
                )[]

                if (plugin.any) {
                  results.push(
                    ...(await Promise.all(
                      plugin.any.map((fn) => fn({ type, ...opts })),
                    )),
                  )
                }

                if (is(node)) {
                  if (plugin[type]) {
                    results.push(
                      ...(await Promise.all(
                        plugin[type].map((fn) => fn(opts)),
                      )),
                    )
                  }
                }

                return results
              }),
            ),
          ),
        ),
      )
    })
  }

  function register(opts) {
    return function createPlugin(name: string) {
      return function plugin(node) {
        //
      }
    }
  }

  // await store.tsProject.emit()

  // u.forEach((srcFile) => {
  //   srcFile.replaceWithText(
  //     prettier.format(srcFile.getFullText(), {
  //       arrowParens: 'always',
  //       endOfLine: 'crlf',
  //       parser: 'typescript',
  //       jsxSingleQuote: true,
  //       printWidth: 80,
  //       semi: false,
  //       singleQuote: true,
  //       tabWidth: 2,
  //       trailingComma: 'all',
  //     }),
  //   )
  // }, store.tsProject.getSourceFiles())

  return {
    extract,
    register,
    store,
  }
}

export default createMetadataExtractor
