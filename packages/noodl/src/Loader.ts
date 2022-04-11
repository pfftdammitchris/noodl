import * as u from '@jsmanifest/utils'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as nu from 'noodl-utils'
import axios, { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import type { OrArray } from '@jsmanifest/typefest'
import type {
  AppConfig,
  DeviceType,
  Env,
  PageObject,
  RootConfig,
} from 'noodl-types'
import y from 'yaml'
import winston from 'winston'
import regex from './internal/regex'
import { ensureExt } from './utils/fileSystem'
import getLinkStructure from './utils/getLinkStructure'
import shallowMerge from './utils/shallowMerge'
import { extractAssetsUrl } from './utils/extract'
import { fetchYml, parse as parseYml, stringify, withYmlExt } from './utils/yml'
import Visitor from './Visitor'
import * as c from './constants'
import * as t from './types'

const { existsSync, readFile } = fs
const { createNoodlPlaceholderReplacer, hasNoodlPlaceholder, isValidAsset } = nu

class NoodlLoader<
  ConfigKey extends string = string,
  DataType extends t.Loader.RootDataType = 'map',
> implements t.ILoader<DataType>
{
  #configKey = ''
  #configVersion = 'latest'
  #remoteBaseUrl = ''
  cbs = {} as Record<string, ((...arguments_: any[]) => any)[]>
  deviceType: DeviceType = 'web'
  dataType: DataType
  env: Env = 'test'
  log: winston.Logger
  options = {
    dataType: 'map' as DataType,
    loglevel: 'error' as t.Loader.Options<ConfigKey, DataType>['loglevel'],
  }

  root: t.Loader.Root<DataType>;

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      appKey: this.appKey,
      appConfigUrl: this.appConfigUrl,
      assetsUrl: this.assetsUrl,
      baseUrl: this.baseUrl,
      cbs: this.cbs,
      configKey: this.configKey,
      configVersion: this.configVersion,
      dataType: this.dataType,
      deviceType: this.deviceType,
      env: this.env,
      options: this.options,
      pageNames: this.pageNames,
      totalRootObjects: this.root.size,
    }
  }

  constructor(opts: ConfigKey | t.Loader.Options<ConfigKey, DataType> = {}) {
    this.log = winston.createLogger({
      level: 'error',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({
              colors: {
                info: 'cyan',
                http: 'grey',
                warn: 'yellow',
                error: 'red',
                debug: 'gray',
              },
            }),
            winston.format.simple(),
          ),
        }),
      ],
    })

    const options = u.isStr(opts) ? { config: opts } : opts
    const configKey = options.config
    const dataType = options.dataType === 'object' ? 'object' : 'map'
    const defaultKeys = ['Global']

    this.configKey = configKey
    this.dataType = dataType as DataType
    this.options = shallowMerge(this.options, options)
    this.log.level = options.loglevel || this.options.loglevel
    this.log.debug(`Options`, this.options)
    this.log.debug(
      `Instantiating with config: ${u.yellow(
        this.configKey || '<no config received>',
      )}`,
    )

    this.log.debug(
      `Initiating root with with default keys: ${u.yellow(
        defaultKeys.join(', '),
      )}`,
    )

    if (dataType === 'object') {
      this.log.debug(
        `Data type set to ${u.yellow(
          `object`,
        )} mode. Root will be a plain object`,
      )
      this.root = {} as t.Loader.Root<DataType>
      u.forEach((key) => (this.root[key] = {}), defaultKeys)
    } else {
      this.log.debug(
        `Data type set to ${u.yellow(`map`)} mode. Root will be a Map`,
      )
      ;(this.root as Map<any, any>) = new Map()
      u.forEach((key) => this.root.set(key, new y.Document()), defaultKeys)
      Object.defineProperty(this.root, 'toJSON', {
        value: () => {
          const output = {}
          for (const [name, document_] of this.root as Map<any, any>) {
            y.isDocument(document_) && (output[name] = document_?.toJSON?.())
          }
          return output
        },
      })
    }

    this.log.debug(
      `Initiated root ${
        options.dataType === 'object' ? `as an object` : 'with a map'
      } with default keys: ${u.yellow(
        options.dataType === 'object'
          ? u.keys(this.root).join(', ')
          : [...this.root.keys()].join(', '),
      )}`,
    )
  }

  #fetch = (url: string, opts?: AxiosRequestConfig) => axios.get(url, opts)

  async init({
    dir = '',
    fallback,
    loadPages: shouldLoadPages = true,
    loadPreloadPages: shouldLoadPreloadPages = true,
    requestOptions,
    spread,
  }: {
    dir?: string
    fallback?: {
      appConfig?: Parameters<
        NoodlLoader<ConfigKey, DataType>['loadAppConfig']
      >[0]['fallback']
    }
    loadPages?: boolean
    loadPreloadPages?: boolean
    requestOptions?: AxiosRequestConfig
    spread?: string | string[]
  } = {}) {
    if (!this.configKey) {
      throw new Error(
        `Cannot initiate the aggregator without setting a config key first`,
      )
    }

    this.log.info(`Using app key ${u.yellow(this.appKey)}`)
    this.log.info(`Using device type ${u.yellow(this.deviceType)}`)
    this.log.info(`Using eCOS environment: ${u.yellow(this.env)}`)

    const result = [
      await this.loadRootConfig({ dir, requestOptions }),
      await this.loadAppConfig({
        dir,
        fallback: fallback?.appConfig,
        requestOptions,
      }),
    ] as unknown

    shouldLoadPreloadPages &&
      (await this.loadPreloadPages({ dir, requestOptions, spread }))
    shouldLoadPages && (await this.loadPages({ dir, requestOptions, spread }))

    return result as DataType extends 'map'
      ? [y.Document<RootConfig>, y.Document<AppConfig>]
      : [RootConfig, AppConfig]
  }

  #getRemoteConfigUrl = () => {
    return `https://${c.defaultConfigHostname}/config/${withYmlExt(
      this.configKey,
    )}`
  }

  #toRootPageKey = (filepath: string, extension = '.yml') =>
    path
      .basename(
        filepath,
        extension.startsWith('.') ? extension : `.${extension}`,
      )
      .replace(/(_en|~\/)/gi, '')

  #getRootConfig = () =>
    (this.getInRoot(this.configKey) ||
      this.getInRoot(
        ensureExt(this.configKey, 'yml'),
      )) as DataType extends 'map' ? y.Document.Parsed : RootConfig

  #replaceNoodlPlaceholders = (str = '') => {
    return createNoodlPlaceholderReplacer({
      cadlBaseUrl:
        this.getIn(this.#getRootConfig(), 'cadlBaseUrl') ||
        this.getIn(this.#getRootConfig(), 'baseUrl'),
      cadlVersion: this.configVersion,
      designSuffix: '',
    })(str)
  }

  get appConfigUrl() {
    return this.#replaceNoodlPlaceholders(
      `${this.baseUrl}${ensureExt(this.appKey, 'yml')}`,
    )
  }

  get appKey() {
    return (
      (
        (this.getIn(this.#getRootConfig(), 'cadlMain') || '') as string
      )?.replace('.yml', '') || ''
    )
  }

  get assetsUrl() {
    return (
      `${
        this.getIn(this.#getRootConfig(), 'cadlBaseUrl') || ''
      }assets/`.replace(`$\{cadlBaseUrl}`, this.baseUrl) || ''
    )
  }

  get baseUrl() {
    return (this.getIn(this.#getRootConfig(), 'cadlBaseUrl') || '') as string
  }

  get configKey() {
    return this.#configKey
  }

  set configKey(configKey) {
    this.#configKey = configKey
    this.emit(c.configKeySet, configKey)
  }

  get configVersion() {
    if (this.#configVersion === 'latest') {
      return (this.getIn?.(this.#getRootConfig(), [
        this.deviceType,
        'cadlVersion',
        this.env,
      ]) || '') as string
    }
    if (!this.#configVersion) {
      const rootConfig = this.getInRoot(this.configKey)
      if (rootConfig) {
        const path = [this.deviceType, 'cadlVersion', this.env]
        if (this.dataType === 'map') return rootConfig.getIn(path)
        return get(rootConfig, path)
      }
    }
    return this.#configVersion
  }

  set configVersion(configVersion) {
    this.#configVersion = configVersion
  }

  get remoteBaseUrl() {
    return this.#remoteBaseUrl
  }

  get pageNames() {
    let appConfig = this.getInRoot(this.appKey) as y.Document
    let preloadPages = this.getIn(appConfig, 'preload') || []
    let pages = this.getIn(appConfig, 'page') || []
    if (y.isSeq(preloadPages)) preloadPages = preloadPages.toJSON()
    if (y.isSeq(pages)) pages = pages.toJSON()
    return [...preloadPages, ...pages] as string[]
  }

  emit<Evt extends keyof t.Loader.Hooks>(
    event: Evt,
    arguments_:
      | Parameters<t.Loader.Hooks[Evt]>
      | Parameters<t.Loader.Hooks[Evt]>[0],
  ) {
    // @ts-expect-error
    this.cbs[event]?.forEach?.((fn) => fn(u.array(arguments_)))
  }

  async extractAssets() {
    if (!this.configKey) throw new Error(`No configKey was set`)
    let remoteAssetsUrl = this.assetsUrl

    if (
      regex.localAddress.test(remoteAssetsUrl) ||
      !remoteAssetsUrl.startsWith('http')
    ) {
      // Converts to the remote url
      const rootConfig = await fetchYml(this.#getRemoteConfigUrl())
      remoteAssetsUrl = extractAssetsUrl(rootConfig)
    }

    const assets = [] as t.LinkStructure[]
    const visitedAssets = [] as string[]
    const urlCache = [] as string[]

    const addAsset = (assetPath: string) => {
      if (!visitedAssets.includes(assetPath) && isValidAsset(assetPath)) {
        assets.push(
          getLinkStructure(assetPath, {
            prefix: remoteAssetsUrl,
            config: this.configKey,
          }),
        )
      }
    }

    if (this.dataType === 'map') {
      const nodes = this.root?.values?.() || []
      for (let visitee of nodes) {
        y.visit(visitee, {
          Scalar: (_, node) => {
            if (u.isStr(node.value)) {
              const value = node.value
              if (regex.video.test(value) && !urlCache.includes(value)) {
                urlCache.push(value)
                this.log.debug(`Found asset: ${u.magenta(value)}`)
                addAsset(value)
              }
            }
          },
        })
      }
    } else {
      Visitor.createVisitor((key, value) => {
        if (
          u.isStr(value) &&
          regex.video.test(value) &&
          !urlCache.includes(value)
        ) {
          urlCache.push(value)
          this.log.debug(
            `Found ${u.yellow(String(key))} asset: ${u.magenta(value)}`,
          )
          addAsset(value)
        }
      })(this.root)
    }

    return assets
  }

  getIn(
    obj: Record<string, any> | y.Document | y.Document.Parsed,
    key: string | string[],
  ) {
    if (y.isDocument(obj)) return obj.getIn(u.array(key))
    return get(obj, key)
  }

  getConfigVersion(document_ = this.getInRoot(this.configKey)): string {
    return this.getIn(document_, [this.deviceType, 'cadlVersion', this.env])
  }

  getPageUrl(pathname: string | undefined) {
    return pathname ? `${this.baseUrl}${pathname}` : ''
  }

  getInRoot(key: string) {
    if (this.root instanceof Map) return this.root.get(key)
    return this.root[key]
  }

  hasInRoot(key: string) {
    if (this.root instanceof Map) return this.root.has(key)
    return key in this.root
  }

  setInRoot(key: string, value: any) {
    if (this.root instanceof Map) this.root.set(key, value)
    this.root[key] = value
  }

  /**
   *  Loads the root config. If a directory is given it will attempt to load from a file path. It will fallback to a fresh remote fetch if all else fails
   * @param { string | undefined } options.dir Directory to load the root config from if loading from a directory
   * @param { string | undefined } options.config Config name to override the current config name if provided
   */
  async loadRootConfig(options: {
    dir: string
    config?: string
    requestOptions?: AxiosRequestConfig
  }): Promise<DataType extends 'map' ? y.Document : Record<string, any>>

  async loadRootConfig(
    config: y.Document | Record<string, any>,
  ): Promise<DataType extends 'map' ? y.Document : Record<string, any>>

  async loadRootConfig(
    configName?: string,
    configUrl?: string,
    requestOptions?: AxiosRequestConfig,
  ): Promise<DataType extends 'map' ? y.Document : Record<string, any>>

  async loadRootConfig(
    options:
      | y.Document
      | Record<string, any>
      | { dir: string; config?: string; requestOptions?: AxiosRequestConfig }
      | string = this.configKey,
    customConfigUrl?: string,
    requestOptionsProp?: AxiosRequestConfig,
  ) {
    let configDocument:
      | (DataType extends 'map' ? y.Document : Record<string, any>)
      | undefined
    let configYml = ''
    let requestOptions: AxiosRequestConfig

    if (y.isDocument(options)) {
      configDocument = options as any
      configYml = y.stringify(options, { indent: 2 })
      this.#remoteBaseUrl = configDocument.get('cadlBaseUrl')
      this.log.debug(
        `Loaded root config with a provided ${
          this.dataType == 'map' ? 'y doc' : 'object'
        }`,
      )
    } else if (u.isObj(options)) {
      if (
        'dir' in options ||
        'config' in options ||
        'requestOptions' in options
      ) {
        options?.config && (this.configKey = options.config)
        options?.requestOptions && (requestOptions = options.requestOptions)
        const dir = options.dir || ''
        const configFilePath = path.join(dir, ensureExt(this.configKey, 'yml'))
        if (existsSync(configFilePath)) {
          this.log.debug(
            `Loading root config from: ${u.yellow(configFilePath)}`,
          )
          configYml = await readFile(configFilePath, 'utf8')
          configDocument = parseYml(this.dataType, configYml)
          this.#remoteBaseUrl =
            this.dataType === 'map'
              ? configDocument.get('cadlBaseUrl')
              : configDocument['cadlBaseUrl']
        } else {
          if (!dir) {
            this.log.debug(
              `Fetching config ${u.yellow(this.configKey)} remotely`,
            )
          } else {
            this.log.error(
              `Tried to load root config from ${u.yellow(
                configFilePath,
              )} but the location does not exist`,
            )
          }
        }
      } else {
        this.log.debug(`Loading the root config provided to arguments`)
        configYml = y.stringify(options)
        configDocument = options as any
      }
    } else if (u.isStr(options)) {
      this.configKey = options
      this.log.debug(`Fetching config ${u.yellow(options)} remotely`)
    }

    if (!this.configKey) {
      throw new Error(
        `Cannot retrieve the root config because a config key was not passed in or set`,
      )
    }

    configDocument && !configYml && (configYml = stringify(configDocument))
    configYml &&
      !configDocument &&
      (configDocument = parseYml(this.dataType, configYml))
    requestOptionsProp && (requestOptions = requestOptionsProp)

    const configUrl =
      customConfigUrl ||
      `https://${c.defaultConfigHostname}/config/${withYmlExt(this.configKey)}`

    if (!configYml || !configDocument) {
      this.log.info(`Config URL: ${u.yellow(configUrl)}`)
      this.emit(c.rootConfigIsBeingRetrieved, {
        configKey: this.configKey,
        configUrl,
      })
      const { data: yml } = await this.#fetch(configUrl, requestOptions)
      this.log.debug(`Received config y`)
      configDocument = parseYml(this.dataType, yml)
      if (!this.#remoteBaseUrl) {
        this.#remoteBaseUrl =
          this.dataType === 'map'
            ? configDocument.get('cadlBaseUrl')
            : configDocument['cadlBaseUrl']
      }
      this.log.debug(
        `Saved config in memory as a y ${
          this.dataType == 'map' ? 'doc' : 'object'
        }`,
      )
      configYml = yml
    }

    this.setInRoot(this.configKey, configDocument)
    this.log.debug(`Root key ${u.yellow(this.configKey)} set`)
    this.emit(c.rootConfigRetrieved, {
      rootConfig: configDocument as DataType extends 'map'
        ? y.Document
        : RootConfig,
      url: configUrl,
      yml: configYml,
    })

    this.configVersion = this.getConfigVersion(configDocument)
    this.log.info(
      `Config version: ${u.yellow(this.configVersion) || '<unknown>'}`,
    )
    this.emit(c.configVersionSet, this.configVersion)

    y.visit(
      this.dataType == 'map'
        ? (configDocument as any)
        : y.parseDocument(y.stringify(configDocument)),
      {
        Pair: (key, node) => {
          if (y.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
            this.log.debug(
              `Encountered base url: ${u.yellow(String(node.value))}`,
            )
            if (
              y.isScalar(node.value) &&
              u.isStr(node.value) &&
              hasNoodlPlaceholder(node.value)
            ) {
              const before = node.value.value as string
              node.value.value = this.#replaceNoodlPlaceholders(
                node.value.value as string,
              )
              this.log.info(
                `Setting base url to ${u.magenta(String(node.value.value))}`,
              )
              this.emit(c.placeholderPurged, {
                before,
                after: node.value.value as string,
              })
              return y.visit.SKIP
            }
          }
        },
        Scalar: (key, node) => {
          if (u.isStr(node.value) && hasNoodlPlaceholder(node.value)) {
            const before = node.value
            node.value = this.#replaceNoodlPlaceholders(node.value)
            this.log.info(
              `Replaced a placeholder from ${u.yellow(before)} to ${u.magenta(
                String(node.value),
              )}`,
            )
            this.emit(c.placeholderPurged, {
              before,
              after: node.value as string,
            })
          }
        },
      },
    )

    return configDocument
  }

  /**
   * Loads the app config. If a directory is passed it will attempt to load the app config from a file path. It will fallback to a fresh remote fetch if all else fails
   * @param { string | undefined } dir Directory to load from if loading from a directory
   * @param { function | undefined } fallback Used as a resolution strategy to load the app config if fetching fails
   * @returns
   */
  async loadAppConfig({
    dir,
    fallback,
    requestOptions,
  }: {
    dir?: string
    fallback?: () => Promise<string> | string
    requestOptions?: AxiosRequestConfig
  } = {}) {
    if (!this.getInRoot(this.configKey)) {
      throw new Error(
        'Cannot initiate app config without retrieving the root config',
      )
    }

    // Placeholders should already have been purged by this time
    let appConfigYml = ''
    let appConfigDocument:
      | (DataType extends 'map' ? y.Document : Record<string, any>)
      | undefined
    let yml = ''

    if (dir) {
      const appConfigFilePath = path.resolve(
        path.join(dir, ensureExt(this.appKey, 'yml')),
      )
      if (existsSync(appConfigFilePath)) {
        this.log.debug(
          `Loading app config from: ${u.yellow(appConfigFilePath)}`,
        )
        appConfigYml = await readFile(appConfigFilePath, 'utf8')
        this.log.debug(`Retrieved app config yml`)
        appConfigDocument = parseYml(this.dataType, appConfigYml)
        this.log.debug(
          `Loaded app config as a y ${
            this.dataType === 'map' ? 'doc' : 'object'
          }`,
        )
      } else {
        this.log.error(
          `Attempted to load the app config (${u.yellow(
            'cadlEndpoint',
          )}) from ${u.yellow(
            appConfigFilePath || '<App config file path is empty>',
          )} but the location does not exist`,
        )
      }
    }

    if (!appConfigYml || !appConfigDocument) {
      this.log.debug(`Retrieving app config remotely`)
      this.emit(c.appConfigIsBeingRetrieved, {
        appKey: this.appKey,
        rootConfig: this.#getRootConfig(),
        url: this.appConfigUrl,
      })
      try {
        yml = (await this.#fetch(this.appConfigUrl, requestOptions)).data
        this.log.info(`Retrieved app config y`)
      } catch (error) {
        this.log.error(
          `[${chalk.red('Error')}] ${chalk.yellow('loadAppConfig')}: ${
            (error as Error).message
          }. ` +
            `If a fallback loader was provided, it will be used. ` +
            `Otherwise the app config will be undefined`,
          { fallbackProvided: u.isFnc(fallback) },
        )
        u.isFnc(fallback) && (yml = await fallback())
      }
    }

    appConfigYml = yml || appConfigYml
    appConfigDocument = parseYml(this.dataType, appConfigYml)

    this.emit(c.appConfigRetrieved, {
      appKey: this.appKey,
      appConfig: appConfigDocument as DataType extends 'map'
        ? y.Document.Parsed
        : AppConfig,
      rootConfig: this.#getRootConfig(),
      yml: appConfigYml,
      url: this.appConfigUrl,
    })

    if (appConfigYml) {
      this.setInRoot(this.appKey, appConfigDocument)
      this.log.debug(
        `Loaded app config as a y ${
          this.dataType === 'map' ? 'doc' : 'object'
        } on root key: ${u.yellow(this.appKey)}`,
      )
    } else {
      this.log.error(`Attempted to load app config but it was empty or invalid`)
    }
    this.emit(c.appConfigParsed, {
      name: this.appKey,
      appConfig: appConfigDocument as DataType extends 'map'
        ? y.Document
        : AppConfig,
    })
    return appConfigDocument
  }

  async loadPage(
    options: { requestOptions?: AxiosRequestConfig } & (DataType extends 'map'
      ? {
          dir: string
          doc?: y.Document
          name: string
          spread?: OrArray<string>
        }
      : {
          dir: string
          name: string
          object?: Record<string, any>
          spread?: OrArray<string>
        }),
  ): Promise<
    | (DataType extends 'map'
        ? y.Node | y.Document<unknown>
        : Record<string, any>)
    | undefined
  >

  async loadPage(
    name: string | undefined,
    document_?: y.Document,
    requestOptions?: AxiosRequestConfig,
  ): Promise<y.Node | y.Document<unknown> | undefined>

  async loadPage(
    options:
      | ({ requestOptions?: AxiosRequestConfig } & (DataType extends 'map'
          ? {
              dir: string
              doc?: y.Document
              name: string
              spread?: OrArray<string>
            }
          : {
              dir: string
              name: string
              object?: Record<string, any>
              spread?: OrArray<string>
            }))
      | string
      | undefined = '',
    documentOrObject?: y.Document | Record<string, any>,
    requestOptionsProp?: AxiosRequestConfig,
  ) {
    let dir = ''
    let name = ''
    let requestOptions: AxiosRequestConfig
    let spread = [] as string[]

    if (u.isObj(options)) {
      name = options.name
      dir = options.dir
      requestOptions = options.requestOptions
      documentOrObject =
        'doc' in options
          ? // @ts-expect-error
            options.doc
          : 'object' in options
          ? // @ts-expect-error
            options.object
          : undefined
      u.forEach((s) => s && spread.push(s), u.array(options.spread))
    }

    if (requestOptionsProp) requestOptions = requestOptionsProp

    try {
      const key = this.#toRootPageKey(name)

      if (dir && existsSync(dir)) {
        let filepath = ''

        for (const filename of [`${key}.yml`, `${key}_en.yml`]) {
          filepath = path.join(dir, filename)

          if (existsSync(filepath)) {
            const pageName = filename.replace(/(_en|\.yml)/i, '')
            const yml = await readFile(filepath, 'utf8')
            if (yml) {
              documentOrObject = parseYml(this.dataType, yml)

              // Format from { SignIn : { SignIn: {...} } } to { SignIn: {...} }
              {
                if (this.dataType === 'map') {
                  if (
                    y.isDocument(documentOrObject) &&
                    documentOrObject.has(pageName)
                  ) {
                    documentOrObject.contents = documentOrObject.get(pageName)
                  }
                  if (
                    y.isMap(documentOrObject) &&
                    documentOrObject.has(pageName)
                  ) {
                    documentOrObject
                  }
                } else if (u.isObj(documentOrObject)) {
                  if (pageName in documentOrObject) {
                    documentOrObject = documentOrObject[pageName]
                  }
                }

                this.setInRoot(key, documentOrObject)
              }

              this.log.debug(`Saved a node on root key: ${u.yellow(key)}`)
              this.emit(c.appPageRetrieved, {
                pageName,
                pageObject: documentOrObject as DataType extends 'map'
                  ? y.Document
                  : PageObject,
                fromDir: true,
              })
              if (!spread.includes(key)) return this.getInRoot(key || '')
            }
            break
          }
        }
      }

      const spreadKeys = (
        keys: OrArray<string>,
        documentOrObject?: DataType extends 'map'
          ? y.Document
          : Record<string, any>,
      ) => {
        this.log.debug(`Spreading keys: ${u.yellow(u.array(keys).join(', '))}`)
        const spreadFunction = (value: y.Document | Record<string, any>) => {
          if (y.isMap(value)) {
            for (const pair of value.items) {
              if (y.isScalar(pair.key)) {
                this.setInRoot(
                  String(pair.key),
                  parseYml(this.dataType, y.stringify(pair.value)),
                )
              }
            }
          } else if (y.isDocument(value) && y.isMap(value.contents)) {
            for (const pair of value.contents.items) {
              if (y.isScalar(pair.key)) {
                this.setInRoot(
                  String(pair.key),
                  parseYml(this.dataType, y.stringify(pair.value)),
                )
              }
            }
          } else if (u.isObj(value)) {
            for (const [key, val] of u.entries(value)) {
              if (u.isStr(val)) {
                this.setInRoot(key, parseYml(this.dataType, val))
              } else {
                this.setInRoot(key, val)
              }
            }
          }
        }

        if (documentOrObject) {
          spreadFunction(documentOrObject)
          u.array(keys).forEach((key) => delete this.root[key])
        } else {
          for (const key of u.array(keys)) {
            if (this.hasInRoot(key)) {
              spreadFunction(this.getInRoot(key))
            }
          }
        }
      }

      if (u.isStr(name)) {
        const pageUrl = this.getPageUrl(`${key}_en.yml`)
        const { data: yml } = await this.#fetch(pageUrl, requestOptions)
        documentOrObject = parseYml(this.dataType, yml)
        if (spread.includes(name)) spreadKeys(name, documentOrObject as any)
        this.setInRoot(key, documentOrObject)
      } else if (name && y.isDocument(documentOrObject)) {
        if (spread.includes(name)) spreadKeys(name, documentOrObject as any)
        this.setInRoot(key, documentOrObject)
      } else {
        this.log.error(
          `Page ${u.yellow(
            name || '<empty>',
          )} was not loaded because of bad parameters`,
        )
      }

      if (name) {
        this.log.info(`Loaded page ${u.yellow(name)}`)
        this.emit(c.appPageRetrieved, {
          pageName: name,
          pageObject: documentOrObject as DataType extends 'map'
            ? y.Document
            : PageObject,
        })
        return this.getInRoot(key || '')
      }
    } catch (error) {
      if (error instanceof Error) {
        if ((error as any).response?.status === 404) {
          this.log.error(
            `[${chalk.red(error.name)}]: Could not find page ${u.red(
              name || '',
            )}`,
          )
          this.emit(c.appPageNotFound, {
            appKey: this.appKey,
            pageName: name,
            error,
          })
        } else {
          this.log.error(
            `[${chalk.yellow(error.name)}] on page ${u.red(name || '')}: ${
              error.message
            }`,
          )
        }
        this.emit(c.appPageRetrieveFailed, {
          error,
          pageName: name,
        })
      }
    }
  }

  async loadPreloadPages({
    dir = '',
    requestOptions,
    spread,
  }: {
    dir?: string
    requestOptions?: AxiosRequestConfig
    spread?: OrArray<string>
  } = {}) {
    const spreadKeys = u.array(spread)
    const preloadPages = [] as string[]
    const seq = this.getIn(this.getInRoot(this.appKey) as y.Document, 'preload')

    this.log.debug(
      `Loading preload pages in ${
        this.dataType === 'map' ? 'doc' : 'object'
      } format`,
    )

    if (y.isSeq(seq)) {
      for (const node of seq.items) {
        if (y.isScalar(node) && u.isStr(node.value)) {
          if (!this.hasInRoot(node.value)) {
            let logMessage = `Adding preload page: ${u.yellow(node.value)}`
            if (spreadKeys.includes(node.value)) {
              logMessage += ` (its keys ${u.white(`will spread`)} on root)`
            }
            this.log.debug(logMessage)
            preloadPages.push(node.value)
          } else {
            this.log.warn(
              `Preload page "${u.yellow(node.value)}" already exists`,
            )
          }
        }
      }
    } else if (u.isArr(seq)) {
      for (const name of seq) {
        if (u.isStr(name) && !this.hasInRoot(name)) {
          let logMessage = `Adding preload page: ${u.yellow(name)}`
          if (spreadKeys.includes(name)) {
            logMessage += ` (its keys ${u.white(`will spread`)} on root)`
          }
          this.log.debug(logMessage)
          preloadPages.push(name)
        }
      }
    }

    return Promise.all(
      preloadPages.map(async (page) =>
        this.loadPage({ name: page, dir, requestOptions, spread: spreadKeys }),
      ),
    )
  }

  async loadPages({
    chunks = 4,
    dir = '',
    requestOptions,
    spread,
  }: {
    chunks?: number
    dir?: string
    requestOptions?: AxiosRequestConfig
    spread?: OrArray<string>
  } = {}) {
    const pages = [] as string[]
    const nodes = this.getIn(this.getInRoot(this.appKey), 'page')

    this.log.debug(
      `Loading pages in ${this.dataType === 'map' ? 'doc' : 'object'} format`,
    )

    if (y.isSeq(nodes)) {
      for (const node of nodes.items) {
        if (y.isScalar(node) && u.isStr(node.value)) {
          !pages.includes(node.value) && pages.push(node.value)
          if (!pages.includes(node.value)) {
            this.log.info(`Loading page: "${u.yellow(node.value)}"`)
          }
        }
      }
    } else if (u.isArr(nodes)) {
      for (const node of nodes) {
        if (u.isStr(node)) {
          !pages.includes(node) && pages.push(node)
          if (!pages.includes(node)) {
            this.log.info(`Loading page: "${u.yellow(node)}"`)
          }
        }
      }
    }

    const chunkedPages = chunk(pages, chunks)

    this.log.debug(
      `${u.yellow(String(pages.length))} pages are being loaded in ${u.yellow(
        String(chunkedPages.length),
      )} chunks ${u.italic('concurrently')}`,
    )

    const allPages = await Promise.all(
      chunkedPages.map((chunked) =>
        Promise.all(
          chunked.map(async (c) =>
            this.loadPage({ name: c, dir, requestOptions, spread }),
          ),
        ),
      ),
    )

    this.log.info(
      `${u.yellow(
        String(chunkedPages.length * chunks),
      )} pages in total were loaded`,
    )

    return flatten(allPages)
  }

  on<Event_ extends keyof t.Loader.Hooks>(
    event_: Event_,
    function_: (arguments_: t.Loader.Hooks[Event_]) => void,
  ) {
    !u.isArr(this.cbs[event_]) && (this.cbs[event_] = [])
    this.cbs[event_]?.push(function_)
    return this
  }
}

export default NoodlLoader
