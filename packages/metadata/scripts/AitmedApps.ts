import dotenv from 'dotenv'
dotenv.config()
import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import { Loader } from 'noodl'
import fs from 'fs-extra'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'

const tag = `[${chalk.keyword('navajowhite')('apps')}]`

function throwError(err) {
  if (err instanceof Error) throw err
  throw new Error(err)
}

const TOKEN = process.env.GITLAB_TOKEN

const headers = {
  'PRIVATE-TOKEN': TOKEN,
}

export interface AppObject<S extends string = string> {
  config: S
  url: string
  pathname: string
  data: null | nt.RootConfig
}

const baseConfigUrl = 'https://public.aitmed.com/config'

function createAppObject(config = '') {
  config.startsWith('/') && (config = config.substring(1))
  const pathname = `/${config.replace(/\//g, '')}`
  return {
    config,
    url: `${baseConfigUrl}${pathname}`,
    pathname,
    data: null,
  }
}

class AitmedApps {
  #apps = new Map<string, AppObject>()
  #aggregators = new Map<string, Loader>()

  constructor(apps: string | string[]) {
    this.load(apps)
  }

  async load(apps: string | string[]) {
    try {
      const loadedApps = await Promise.allSettled(
        u.array(apps).map(async (config) => {
          try {
            const appObject = createAppObject(config)
            this.#apps.set(config, appObject)
            const aggregator = new Loader(config)
            this.#aggregators.set(config, aggregator)
            await aggregator.init({ loadPages: true, loadPreloadPages: true })
            return {
              aggregator,
              appObject,
              config,
            }
          } catch (error) {
            throwError(error)
          }
        }),
      )

      for (const app of loadedApps) {
        if (app.status === 'fulfilled') {
          const { aggregator, appObject, config } = app.value
        } else if (app.status === 'rejected') {
          const { reason } = app
        }
      }
    } catch (error) {
      throwError(error)
    }
  }
}

export default AitmedApps
