import * as u from '@jsmanifest/utils'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as nu from 'noodl-utils'
import axios from 'axios'
import chalk from 'chalk'
import chunk from 'lodash/chunk'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import type { OrArray } from '@jsmanifest/typefest'
import type { AppConfig, DeviceType, Env, RootConfig } from 'noodl-types'
import yaml from 'yaml'
import winston from 'winston'
import fetchYml from './utils/fetchYml'
import getLinkStructure from './utils/getLinkStructure'
import promiseAllSafely from './utils/promiseAllSafely'
import stringifyDocument from './utils/stringifyDoc'
import shallowMerge from './utils/shallowMerge'
import withYmlExtension from './utils/withYmlExtension'
import { extractAssetsUrl } from './utils/extract'
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
  cbs = {} as Record<string, ((...arguments_: any[]) => any)[]>
  deviceType: DeviceType = 'web'
  dataType: DataType
  env: Env = 'test'
  logger: winston.Logger
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
    this.logger = winston.createLogger({
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
    this.logger.level = options.loglevel || this.options.loglevel
    this.logger.debug(`Options`, this.options)
    this.logger.debug(
      `Instantiating with config: ${u.yellow(
        this.configKey || '<no config received>',
      )}`,
    )

    this.logger.debug(
      `Initiating root with with default keys: ${u.yellow(
        defaultKeys.join(', '),
      )}`,
    )

    if (dataType === 'object') {
      this.logger.debug(
        `Data type set to ${u.yellow(
          `object`,
        )} mode. Root will be a plain object`,
      )
      this.root = {} as t.Loader.Root<DataType>
      u.forEach((key) => (this.root[key] = {}), defaultKeys)
    } else {
      this.logger.debug(
        `Data type set to ${u.yellow(`map`)} mode. Root will be a Map`,
      )
      ;(this.root as Map<any, any>) = new Map()
      u.forEach((key) => this.root.set(key, new yaml.Document()), defaultKeys)
      Object.defineProperty(this.root, 'toJSON', {
        value: () => {
          const output = {}
          for (const [name, document_] of this.root as Map<any, any>) {
            yaml.isDocument(document_) && (output[name] = document_?.toJSON?.())
          }
          return output
        },
      })
    }

    this.logger.debug(
      `Initiated root ${
        options.dataType === 'object' ? `as an object` : 'with a map'
      } with default keys: ${u.yellow(
        options.dataType === 'object'
          ? u.keys(this.root).join(', ')
          : [...this.root.keys()].join(', '),
      )}`,
    )
  }

  #getRemoteConfigUrl = () => {
    return `https://${c.DEFAULT_CONFIG_HOSTNAME}/config/${withYmlExtension(
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

  #getRootConfig = () => this.getInRoot(this.configKey) as yaml.Document

  get appConfigUrl() {
    const prefix = `${this.baseUrl}${this.appKey}`
    return prefix ? `${prefix}.yml` : prefix
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
    this.emit(c.ON_CONFIG_KEY, configKey)
  }

  get configVersion() {
    if (this.#configVersion === 'latest') {
      return (this.getIn?.(this.#getRootConfig(), [
        this.deviceType,
        'cadlVersion',
        this.env,
      ]) || '') as string
    }
    return this.#configVersion
  }

  set configVersion(configVersion) {
    this.#configVersion = configVersion
  }

  get pageNames() {
    let appConfig = this.getInRoot(this.appKey) as yaml.Document
    let preloadPages = this.getIn(appConfig, 'preload') || []
    let pages = this.getIn(appConfig, 'page') || []
    if (yaml.isSeq(preloadPages)) preloadPages = preloadPages.toJSON()
    if (yaml.isSeq(pages)) pages = pages.toJSON()
    return [...preloadPages, ...pages] as string[]
  }

  emit<Event_ extends keyof t.Loader.Hooks>(
    event: Event_,
    arguments_: t.Loader.Hooks[Event_]['args'],
  ) {
    this.cbs[event]?.forEach?.((function_) => function_(arguments_))
  }

  async extractAssets() {
    if (!this.configKey) throw new Error(`No configKey was set`)
    let remoteAssetsUrl = this.assetsUrl

    if (
      /(127.0.0.1|localhost)/.test(remoteAssetsUrl) ||
      !remoteAssetsUrl.startsWith('http')
    ) {
      const rootConfig = await fetchYml(this.#getRemoteConfigUrl())
      remoteAssetsUrl = extractAssetsUrl(rootConfig)
    }

    const urlCache = {}
    const assets = [] as t.LinkStructure[]
    const commonUrlKeys = ['path', 'resource'] as string[]
    const visitedAssets = [] as string[]

    const addAsset = (assetPath: string) => {
      if (!visitedAssets.includes(assetPath) && isValidAsset(assetPath)) {
        const asset = getLinkStructure(assetPath, {
          prefix: remoteAssetsUrl,
          config: this.configKey,
        })
        assets.push(asset)
      }
    }

    for (const visitee of this.root?.values?.() || []) {
      yaml.visit(visitee, {
        Scalar: (_, node) => {
          if (yaml.isScalar(node) && u.isStr(node.value)) {
            if (
              /\.(avi|bmp|gif|jpg|jpeg|png|tif|tiff|mp4)$/i.test(node.value) &&
              !(node.value in urlCache)
            ) {
              this.logger.debug(`Found asset: ${u.magenta(node.value)}`)
              addAsset(node.value)
            }
          }
        },
        Map: (key, node) => {
          for (const key of commonUrlKeys) {
            if (node.has(key)) {
              const value = node.get(key)
              if (u.isStr(value)) {
                if (!(value in urlCache)) {
                  urlCache[value] = value
                  this.logger.debug(
                    `Found ${u.yellow(key)} asset: ${u.magenta(String(value))}`,
                  )
                  addAsset(value)
                }
              }
            }
          }
        },
        Pair: (key, node) => {
          for (const key of commonUrlKeys) {
            if (
              yaml.isScalar(node.key) &&
              u.isStr(node.key.value) &&
              node.key.value === key &&
              !(key in urlCache)
            ) {
              urlCache[key] = key
              this.logger.debug(
                `Found ${u.yellow(key)} asset: ${u.magenta(
                  String(node.value['value']),
                )}`,
              )
              addAsset((node.value as yaml.Scalar<string>).value)
            }
          }
        },
      })
    }

    return assets
  }

  getIn(
    obj: Record<string, any> | yaml.Document | yaml.Document.Parsed,
    key: string | string[],
  ) {
    if (yaml.isDocument(obj)) return obj.getIn(u.array(key))
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

  async init({
    dir = '',
    fallback,
    loadPages: shouldLoadPages = true,
    loadPreloadPages: shouldLoadPreloadPages = true,
    spread,
    use,
  }: {
    dir?: string
    fallback?: {
      appConfig?: Parameters<
        NoodlLoader<ConfigKey, DataType>['loadAppConfig']
      >[0]['fallback']
    }
    loadPages?: boolean
    loadPreloadPages?: boolean
    spread?: string | string[]
    use?: {
      baseUrl?: string
    }
  } = {}) {
    if (!this.configKey) {
      throw new Error(
        `Cannot initiate the aggregator without setting a config key first`,
      )
    }

    this.logger.info(`Using app key ${u.yellow(this.appKey)}`)
    this.logger.info(`Using device type ${u.yellow(this.deviceType)}`)
    this.logger.info(`Using eCOS environment: ${u.yellow(this.env)}`)

    const result = [
      await this.loadRootConfig({ dir }),
      await this.loadAppConfig({ dir, fallback: fallback?.appConfig }),
    ] as unknown

    shouldLoadPreloadPages && (await this.loadPreloadPages({ dir, spread }))
    shouldLoadPages && (await this.loadPages({ dir, spread }))

    return result as DataType extends 'map'
      ? [yaml.Document<RootConfig>, yaml.Document<AppConfig>]
      : [RootConfig, AppConfig]
  }

  /**
   *  Loads the root config. If a directory is given it will attempt to load from a file path. It will fallback to a fresh remote fetch if all else fails
   * @param { string | undefined } options.dir Directory to load the root config from if loading from a directory
   * @param { string | undefined } options.config Config name to override the current config name if provided
   */
  async loadRootConfig(options: {
    dir: string
    config?: string
  }): Promise<DataType extends 'map' ? yaml.Document : Record<string, any>>

  async loadRootConfig(
    config: yaml.Document | Record<string, any>,
  ): Promise<DataType extends 'map' ? yaml.Document : Record<string, any>>

  async loadRootConfig(
    configName?: string,
  ): Promise<DataType extends 'map' ? yaml.Document : Record<string, any>>

  async loadRootConfig(
    options:
      | yaml.Document
      | Record<string, any>
      | { dir: string; config?: string }
      | string = this.configKey,
  ) {
    let configDocument:
      | (DataType extends 'map' ? yaml.Document : Record<string, any>)
      | undefined
    let configYml = ''

    if (yaml.isDocument(options)) {
      configDocument = options as any
      configYml = yaml.stringify(options, { indent: 2 })
      this.logger.debug(
        `Loaded root config with a provided ${
          this.dataType == 'map' ? 'yaml doc' : 'object'
        }`,
      )
    } else if (u.isObj(options)) {
      options?.config && (this.configKey = options.config)
      const dir = options.dir || ''
      const configFilePath = path.join(dir, `${this.configKey}.yml`)
      if (existsSync(configFilePath)) {
        this.logger.debug(
          `Loading root config from: ${u.yellow(configFilePath)}`,
        )
        configYml = await readFile(configFilePath, 'utf8')
        configDocument = this.parseYml(configYml)
      } else {
        if (!dir) {
          this.logger.debug(
            `Fetching config ${u.yellow(this.configKey)} remotely`,
          )
        } else {
          this.logger.error(
            `Tried to load root config from ${u.yellow(
              configFilePath,
            )} but the location does not exist`,
          )
        }
      }
    } else if (u.isStr(options)) {
      this.configKey = options
      this.logger.debug(`Fetching config ${u.yellow(options)} remotely`)
    }

    if (!this.configKey) {
      throw new Error(
        `Cannot retrieve the root config because a config key was not passed in or set`,
      )
    }

    configDocument &&
      !configYml &&
      (configYml =
        this.dataType == 'map'
          ? stringifyDocument(configDocument as yaml.Document)
          : yaml.stringify(configDocument))
    configYml && !configDocument && (configDocument = this.parseYml(configYml))

    if (!configYml || !configDocument) {
      const configUrl = `https://${
        c.DEFAULT_CONFIG_HOSTNAME
      }/config/${withYmlExtension(this.configKey)}`
      this.logger.info(`Config URL: ${u.yellow(configUrl)}`)
      this.emit(c.ON_RETRIEVING_ROOT_CONFIG, { url: configUrl })
      const { data: yml } = await axios.get(configUrl)
      this.logger.debug(`Received config yaml`)
      configDocument = this.parseYml(yml)
      this.logger.debug(
        `Saved config in memory as a yaml ${
          this.dataType == 'map' ? 'doc' : 'object'
        }`,
      )
      configYml = yml
    }

    this.setInRoot(this.configKey, configDocument)
    this.logger.debug(`Root key ${u.yellow(this.configKey)} set`)
    this.emit(c.ON_RETRIEVED_ROOT_CONFIG, {
      name: this.configKey,
      doc: configDocument,
      yml: configYml,
    })

    this.configVersion = this.getConfigVersion(configDocument)
    this.logger.info(
      `Config version: ${u.yellow(this.configVersion) || '<unknown>'}`,
    )
    this.emit(c.ON_CONFIG_VERSION, this.configVersion)

    const replacePlaceholders = createNoodlPlaceholderReplacer({
      cadlBaseUrl: this.getIn(configDocument, 'cadlBaseUrl'),
      cadlVersion: this.configVersion,
      designSuffix: '',
    })

    yaml.visit(
      this.dataType == 'map'
        ? (configDocument as any)
        : yaml.parseDocument(yaml.stringify(configDocument)),
      {
        Pair: (key, node) => {
          if (yaml.isScalar(node.key) && node.key.value === 'cadlBaseUrl') {
            this.logger.debug(
              `Encountered base url: ${u.yellow(String(node.value))}`,
            )
            if (
              yaml.isScalar(node.value) &&
              u.isStr(node.value) &&
              hasNoodlPlaceholder(node.value)
            ) {
              const before = node.value.value as string
              node.value.value = replacePlaceholders(node.value.value)
              this.logger.info(
                `Setting base url to ${u.magenta(String(node.value.value))}`,
              )
              this.emit(c.ON_PLACEHOLDER_PURGED, {
                before,
                after: node.value.value as string,
              })
              return yaml.visit.SKIP
            }
          }
        },
        Scalar: (key, node) => {
          if (u.isStr(node.value) && hasNoodlPlaceholder(node.value)) {
            const before = node.value
            node.value = replacePlaceholders(node.value)
            this.logger.info(
              `Replaced a placeholder from ${u.yellow(before)} to ${u.magenta(
                String(node.value),
              )}`,
            )
            this.emit(c.ON_PLACEHOLDER_PURGED, {
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
  }: {
    dir?: string
    fallback?: () => Promise<string> | string
  } = {}) {
    if (!this.getInRoot(this.configKey)) {
      throw new Error(
        'Cannot initiate app config without retrieving the root config',
      )
    }

    // Placeholders should already have been purged by this time
    let appConfigYml = ''
    let appConfigDocument:
      | (DataType extends 'map' ? yaml.Document : Record<string, any>)
      | undefined
    let yml = ''

    if (dir) {
      const appConfigFilePath = path.resolve(
        path.join(dir, `${this.appKey}.yml`),
      )
      if (existsSync(appConfigFilePath)) {
        this.logger.debug(
          `Loading app config from: ${u.yellow(appConfigFilePath)}`,
        )
        appConfigYml = await readFile(appConfigFilePath, 'utf8')
        this.logger.debug(`Retrieved app config yaml`)
        appConfigDocument = this.parseYml(appConfigYml)
        this.logger.debug(
          `Loaded app config as a yaml ${
            this.dataType === 'map' ? 'doc' : 'object'
          }`,
        )
      } else {
        this.logger.error(
          `Attempted to load the app config (${u.yellow(
            'cadlEndpoint',
          )}) from ${u.yellow(
            appConfigFilePath || '<App config file path is empty>',
          )} but the location does not exist`,
        )
      }
    }

    if (!appConfigYml || !appConfigDocument) {
      this.logger.debug(`Retrieving app config remotely`)
      this.emit(c.ON_RETRIEVING_APP_CONFIG, { url: this.appConfigUrl })
      try {
        yml = (await axios.get(this.appConfigUrl)).data
        this.logger.info(`Retrieved app config yaml`)
      } catch (error) {
        this.logger.error(
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

    this.emit(c.ON_RETRIEVED_APP_CONFIG, (appConfigYml = yml || appConfigYml))
    if (appConfigYml) {
      appConfigDocument = this.parseYml(appConfigYml)
      this.setInRoot(this.appKey, appConfigDocument)
      this.logger.debug(
        `Loaded app config as a yaml ${
          this.dataType === 'map' ? 'doc' : 'object'
        } on root key: ${u.yellow(this.appKey)}`,
      )
    } else {
      this.logger.error(
        `Attempted to load app config but it was empty or invalid`,
      )
    }
    this.emit(c.PARSED_APP_CONFIG, {
      name: this.appKey,
      doc: appConfigDocument as yaml.Document,
    })
    return appConfigDocument
  }

  async loadPage(
    options: DataType extends 'map'
      ? {
          dir: string
          doc?: yaml.Document
          name: string
          spread?: OrArray<string>
        }
      : {
          dir: string
          name: string
          object?: Record<string, any>
          spread?: OrArray<string>
        },
  ): Promise<
    | (DataType extends 'map'
        ? yaml.Node | yaml.Document<unknown>
        : Record<string, any>)
    | undefined
  >

  async loadPage(
    name: string | undefined,
    document_?: yaml.Document,
  ): Promise<yaml.Node | yaml.Document<unknown> | undefined>

  async loadPage(
    options:
      | (DataType extends 'map'
          ? {
              dir: string
              doc?: yaml.Document
              name: string
              spread?: OrArray<string>
            }
          : {
              dir: string
              name: string
              object?: Record<string, any>
              spread?: OrArray<string>
            })
      | string
      | undefined = '',
    documentOrObject?: yaml.Document | Record<string, any>,
  ) {
    let dir = ''
    let name = ''
    let spread = [] as string[]

    if (u.isObj(options)) {
      name = options.name
      dir = options.dir
      documentOrObject =
        'doc' in options
          ? options.doc
          : 'object' in options
          ? options.object
          : undefined
      u.forEach((s) => s && spread.push(s), u.array(options.spread))
    }

    try {
      const key = this.#toRootPageKey(name)

      if (dir && existsSync(dir)) {
        let filepath = ''

        for (const filename of [`${key}.yml`, `${key}_en.yml`]) {
          filepath = path.join(dir, filename)

          if (existsSync(filepath)) {
            const yml = await readFile(filepath, 'utf8')
            if (yml) {
              const pageName = filename.replace(/(_en|\.yml)/i, '')
              documentOrObject = this.parseYml(yml)

              // Format from { SignIn : { SignIn: {...} } } to { SignIn: {...} }
              {
                if (this.dataType === 'map') {
                  if (
                    yaml.isDocument(documentOrObject) &&
                    documentOrObject.has(pageName)
                  ) {
                    documentOrObject.contents = documentOrObject.get(pageName)
                  }
                  if (
                    yaml.isMap(documentOrObject) &&
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

              this.logger.debug(
                `Saved a yaml node on root key: ${u.yellow(key)}`,
              )
              this.emit(c.ON_RETRIEVED_APP_PAGE, {
                name,
                doc: documentOrObject,
                fromDir: true,
              })

              return this.getInRoot(key || '')
            }
            break
          }
        }
      }

      const spreadKeys = (
        keys: OrArray<string>,
        documentOrObject?: DataType extends 'map'
          ? yaml.Document
          : Record<string, any>,
      ) => {
        this.logger.debug(
          `Spreading keys: ${u.yellow(u.array(keys).join(', '))}`,
        )
        const spreadFunction = (value: yaml.Document | Record<string, any>) => {
          if (yaml.isMap(value)) {
            for (const pair of value.items) {
              if (yaml.isScalar(pair.key)) {
                this.setInRoot(
                  String(pair.key),
                  this.parseYml(yaml.stringify(pair.value)),
                )
              }
            }
          } else if (yaml.isDocument(value) && yaml.isMap(value.contents)) {
            for (const pair of value.contents.items) {
              if (yaml.isScalar(pair.key)) {
                this.setInRoot(
                  String(pair.key),
                  this.parseYml(yaml.stringify(pair.value)),
                )
              }
            }
          } else if (u.isObj(value)) {
            for (const [key, val] of u.entries(value)) {
              if (u.isStr(val)) {
                this.setInRoot(key, this.parseYml(val))
              } else {
                this.setInRoot(key, val)
              }
            }
          }
        }

        if (documentOrObject) {
          spreadFunction(documentOrObject)
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
        const { data: yml } = await axios.get(pageUrl)
        if (spread.includes(name)) spreadKeys(name, this.parseYml(yml))
        else this.setInRoot(key, (documentOrObject = this.parseYml(yml)))
      } else if (name && yaml.isDocument(documentOrObject)) {
        if (spread.includes(name)) spreadKeys(name, documentOrObject as any)
        else this.setInRoot(key, documentOrObject)
      } else {
        this.logger.error(
          `Page ${u.yellow(
            name || '<empty>',
          )} was not loaded because of bad parameters`,
        )
      }

      if (name) {
        this.logger.info(`Loaded page ${u.yellow(name)}`)
        this.emit(c.ON_RETRIEVED_APP_PAGE, {
          name,
          doc: documentOrObject,
        })
        return this.getInRoot(key || '')
      }
    } catch (error) {
      if (error instanceof Error) {
        if ((error as any).response?.status === 404) {
          this.logger.error(
            `[${chalk.red(error.name)}]: Could not find page ${u.red(
              name || '',
            )}`,
          )
          this.emit(c.ON_APP_PAGE_DOESNT_EXIST, { name: name as string, error })
        } else {
          this.logger.error(
            `[${chalk.yellow(error.name)}] on page ${u.red(name || '')}: ${
              error.message
            }`,
          )
        }
        this.emit(c.ON_RETRIEVE_APP_PAGE_FAILED, {
          name: name as string,
          error,
        })
      }
    }
  }

  async loadPreloadPages({
    dir = '',
    spread,
  }: { dir?: string; spread?: OrArray<string> } = {}) {
    const spreadKeys = u.array(spread)
    const preloadPages = [] as string[]
    const seq = this.getIn(
      this.getInRoot(this.appKey) as yaml.Document,
      'preload',
    )

    this.logger.debug(
      `Loading preload pages in ${
        this.dataType === 'map' ? 'doc' : 'object'
      } format`,
    )

    if (yaml.isSeq(seq)) {
      for (const node of seq.items) {
        if (yaml.isScalar(node) && u.isStr(node.value)) {
          if (!this.hasInRoot(node.value)) {
            let logMessage = `Adding preload page: ${u.yellow(node.value)}`
            if (spreadKeys.includes(node.value)) {
              logMessage += ` (its keys ${u.white(`will spread`)} on root)`
            }
            this.logger.debug(logMessage)
            preloadPages.push(node.value)
          } else {
            this.logger.warn(
              `Preload page "${u.yellow(node.value)}" already exists`,
            )
          }
        }
      }
    }

    return await promiseAllSafely(
      ...preloadPages.map(async (page) =>
        this.loadPage({ name: page, dir, spread: spreadKeys }),
      ),
    )
  }

  async loadPages({
    chunks = 4,
    dir = '',
    spread,
  }: {
    chunks?: number
    dir?: string
    spread?: OrArray<string>
  } = {}) {
    const pages = [] as string[]
    const nodes = this.getIn(this.getInRoot(this.appKey), 'page')

    this.logger.debug(
      `Loading pages in ${this.dataType === 'map' ? 'doc' : 'object'} format`,
    )

    if (yaml.isSeq(nodes)) {
      for (const node of nodes.items) {
        if (yaml.isScalar(node) && u.isStr(node.value)) {
          !pages.includes(node.value) && pages.push(node.value)
          if (!pages.includes(node.value)) {
            this.logger.info(`Loading page: "${u.yellow(node.value)}"`)
          }
        }
      }
    } else if (u.isArr(nodes)) {
      for (const node of nodes) {
        if (u.isStr(node)) {
          !pages.includes(node) && pages.push(node)
          if (!pages.includes(node)) {
            this.logger.info(`Loading page: "${u.yellow(node)}"`)
          }
        }
      }
    }

    const chunkedPages = chunk(pages, chunks)

    this.logger.debug(
      `${u.yellow(String(pages.length))} pages are being loaded in ${u.yellow(
        String(chunkedPages.length),
      )} chunks ${u.italic('concurrently')}`,
    )

    const allPages = await Promise.all(
      chunkedPages.map((chunked) =>
        Promise.all(
          chunked.map(async (c) => this.loadPage({ name: c, dir, spread })),
        ),
      ),
    )

    this.logger.info(
      `${u.yellow(
        String(chunkedPages.length * chunks),
      )} pages in total were loaded`,
    )

    return flatten(allPages)
  }

  parseYml(
    yml = '',
  ): DataType extends 'map' ? yaml.Document.Parsed : Record<string, any> {
    return this.dataType === 'map' ? yaml.parseDocument(yml) : yaml.parse(yml)
  }

  on<Event_ extends keyof t.Loader.Hooks>(
    event_: Event_,
    function_: (arguments_: t.Loader.Hooks[Event_]['args']) => void,
  ) {
    !u.isArr(this.cbs[event_]) && (this.cbs[event_] = [])
    this.cbs[event_]?.push(function_)
    return this
  }
}

export default NoodlLoader
