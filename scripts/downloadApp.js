import * as u from '@jsmanifest/utils'
import execa from 'execa'
import cron from 'node-cron'
import yaml from 'yaml'
import fs from 'fs-extra'
import chalk from 'chalk'

const CONFIG_PATH = path.resolve(path.join(process.cwd(), 'config.yml'))
const everyMinute = '0 0/1 * 1/1 * ? *'
const everyHour = '0 0 0/1 1/1 * ? *'

const coolGold = (s = '') => chalk.keyword('navajowhite')(s)

cron.schedule(
	everyMinute,
	async () => {
		try {
			if (!fs.existsSync(CONFIG_PATH)) {
				fs.ensureFileSync(CONFIG_PATH)
				u.log(`Created missing config file at ${u.yellow(CONFIG_PATH)}`)
			}

			const config = yaml.parseDocument(fs.readFileSync('./config.yml', 'utf8'))

			if (!config.has('apps')) {
				config.set('apps', [])
				fs.writeFileSync('./config.yml', yaml.stringify(config, { indent: 2 }))
			}

			for (const appName of apps) {
				await execa.command(
					`node cli -c ${appName} -g app --out generated --remote`,
					{
						shell: true,
						stdio: 'inherit',
					},
				)
			}
		} catch (error) {
			console.error(error)
		}
	},
	{},
)
