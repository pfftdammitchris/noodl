import fs from 'fs-extra'
import chalk from 'chalk'
import _ from 'lodash'
import path from 'path'
import * as log from './utils/log'
import Aggregator from './modules/Aggregator'
import Saver, { DataOptions } from './modules/Saver'
import { ParseMode, ParseModeModifier } from './types'
import { paths } from './config'

/** Fetches, parses and saves NOODL page objects to the base object dir */
async function getAllObjects({
  dir,
  endpoint,
  parseMode,
  parseModifier = 'default',
}: {
  dir: string
  endpoint: string
  parseMode: ParseMode
  parseModifier: ParseModeModifier
}) {
  const exts = { [parseMode]: true }
  const saver = new Saver({ dir, exts: { ...exts, yml: false } })
  const aggregator = new Aggregator({ endpoint, ...exts, yml: false })
  const { base } = aggregator

  base.onRootConfig = () => {
    log.yellow(`Retrieved root config using ${chalk.magentaBright(endpoint)}`)
  }

  base.onNoodlConfig = () => {
    log.yellow(`Retrieved noodl config`)
    log.white(`Config version set to ${chalk.yellowBright(base.version)}`)
    log.blank()
  }

  base.onBaseItems = async () => {
    const names = _.keys(base.items)
    let consoleSaveMsg = `Saved rootConfig, noodlConfig`

    _.forEach(names, (name, index, coll) => {
      name && log.green(`Retrieved ${name}`)
      if (index + 1 < coll.length) {
        consoleSaveMsg += `, ${name}`
      } else {
        consoleSaveMsg += `, and ${name} `
      }
    })

    consoleSaveMsg += `to: \n${chalk.magenta(path.normalize(dir))}`

    log.blank()
    log.green(consoleSaveMsg)
    log.blank()
  }

  if (parseModifier !== 'default') {
    if (parseModifier === 'ui') {
      log.blue(
        `The ${chalk.magenta(
          'parseModifier',
        )} option is set to "${chalk.magenta(
          'ui',
        )}", which will include the parsing output from ${chalk.magentaBright(
          'noodl-ui',
        )} for ${chalk.magenta('pages')}`,
      )
    }
  }
  log.blue(`Endpoint set to ${chalk.magentaBright(endpoint)}`)
  log.blue('Cleaning up previous data...')

  await fs.remove(dir)
  await fs.ensureDir(path.resolve(dir, 'pages'))

  log.blue(`Recreated the ${parseMode}s directory`)
  log.blank()

  const items = await aggregator.load({
    includeBasePages: true,
    includePages: true,
  })
  await Promise.all(
    _.map(_.entries(items), async ([name, { json: resolvedPage }]) => {
      const opts = {}
      await saver.save({
        data: resolvedPage,
        dir: path.join(
          paths[parseMode],
          /(base|config)/i.test(name) ? '' : 'pages',
        ),
        filename: name + saver.getExt(),
        type: parseMode,
        ...opts,
      })
      log.green(`Retrieved and saved page ${parseMode}: ${name}`)
    }),
  )
}

export default getAllObjects