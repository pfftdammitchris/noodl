import { Loader } from 'noodl'
import prettier from 'prettier'
import curry from 'lodash/curry.js'
import flowRight from 'lodash/flowRight.js'
import type { visitorFn } from 'yaml'
import {
  isScalar,
  isPair,
  isMap,
  isSeq,
  Node as YAMLNode,
  Document as YAMLDocument,
  YAMLMap,
  YAMLSeq,
  Pair,
  Scalar,
  visit,
} from 'yaml'
import * as tsm from 'ts-morph'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import * as metadataUtils from './utils'
import * as t from './types'

const ts = tsm.ts
const factory = ts.factory

export const store: t.Store = {
  tsProject: new tsm.Project({
    compilerOptions: {
      declaration: true,
      emitDeclarationOnly: true,
      esModuleInterop: true,
      inlineSourceMap: true,
      keyofStringsOnly: true,
      skipLibCheck: true,
      target: tsm.ScriptTarget.ES2020,
      module: tsm.ModuleKind.ES2020,
    },
    manipulationSettings: {
      indentationText: tsm.IndentationText.TwoSpaces,
      newLineKind: tsm.NewLineKind.CarriageReturnLineFeed,
      quoteKind: tsm.QuoteKind.Single,
      useTrailingCommas: true,
    },
    skipLoadingLibFiles: true,
  }),
}

export interface ExtractOptions {
  config: string
  /** @default 'map' */
  dataType?: 'map' | 'object'
  /** @default 'web' */
  deviceType?: nt.DeviceType
  /** @default 'test' */
  env?: nt.Env
  /** @default 'error' */
  logLevel?: t.LogLevel
  loader?: ConstructorParameters<typeof Loader>[0] & {
    init?: Parameters<Loader['init']>[0]
  }
  /** @default 'latest' */
  version?: string
  fns?: ((store: t.Store, root: Record<string, any>, utils: t.Utils) => void)[]
}

async function extract(options?: ExtractOptions) {
  try {
    const loader = new Loader({
      dataType: 'map',
      deviceType: 'web',
      env: 'test',
      loglevel: 'error',
      version: 'latest',
      config: options?.config,
      ...(options?.loader ? u.omit(options.loader, 'init') : undefined),
    })

    const {
      doc: { app: appConfigDoc, root: rootConfigDoc },
    } = await loader.init({
      ...options?.loader?.init,
    })

    const hooks: Record<keyof t.Hooks, t.Hooks[keyof t.Hooks][]> = {
      onComplete: [],
    }

    const createOnComplete = (
      fn: (
        store: t.Store,
        root: Record<string, any>,
        mutils: typeof metadataUtils,
      ) => void,
    ) => (fn ? hooks.onComplete.push(fn) : undefined)

    const utils = {
      ...u.pick(metadataUtils, ['is', 'pascalCase']),
      getLazyTypeAliasType: metadataUtils.tsm.getLazyTypeAliasType,
    }

    const metadataFactory = curry(
      (
        store: t.Store,
        root: Record<string, any>,
        fns: ((
          store: t.Store,
          root: Record<string, any>,
          utils: t.Utils,
        ) => any)[],
      ) => {
        return flowRight(
          ...(fns || []).map((cb) =>
            cb(store, root, {
              ...utils,
              onComplete: createOnComplete,
            }),
          ),
        ) as (name: string, doc: YAMLNode | YAMLDocument) => visitorFn<any>
      },
    )

    const extractMetadata = metadataFactory(store, loader.root, options.fns)

    for (const [name, doc] of loader.root) {
      visit(doc, extractMetadata(name, doc))
    }

    await store.tsProject.emit()

    u.forEach((fn) => fn(store, loader.root, metadataUtils), hooks.onComplete)
    u.forEach((srcFile) => {
      srcFile.replaceWithText(
        prettier.format(srcFile.getFullText(), {
          arrowParens: 'always',
          endOfLine: 'crlf',
          parser: 'typescript',
          jsxSingleQuote: true,
          printWidth: 80,
          semi: false,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
        }),
      )
    }, store.tsProject.getSourceFiles())

    return store
  } catch (error) {
    console.error(error)
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
}

export default extract
