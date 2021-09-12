import * as u from '@jsmanifest/utils'
import path from 'path'
import execa from 'execa'
import cron from 'node-cron'
import yaml from 'yaml'
import fs from 'fs-extra'

const CONFIG_PATH = path.resolve(path.join(process.cwd(), 'config.yml'))
const everyMinute = '* * * * *'
const everyHour = '*/60 * * * *'
const schedule = everyHour

u.log(
	`Scheduling task to run every ${u.cyan(
		schedule === everyMinute
			? 'minute'
			: schedule === everyHour
			? 'hour'
			: '<unknown>',
	)}`,
)

const INITIAL_CONFIG = 'admind2'

if (!fs.existsSync(CONFIG_PATH)) {
	fs.ensureFileSync(CONFIG_PATH)
	u.log(`Created missing config file at ${u.yellow(CONFIG_PATH)}`)
}

const config = yaml.parseDocument(fs.readFileSync(CONFIG_PATH, 'utf8'))

if (!config.has('apps')) {
	const initialValue = new yaml.YAMLSeq()
	initialValue.add(INITIAL_CONFIG)
	config.set('apps', initialValue)
	fs.writeFileSync(CONFIG_PATH, yaml.stringify(config, { indent: 2 }), 'utf8')
}

const apps = config.get('apps')?.toJSON?.() || []

console.log({ apps })

cron.schedule(
	schedule,
	async () => {
		try {
			for (const appName of apps) {
				try {
					await execa.command(
						`noodl -c ${appName} -g app --out generated --remote`,
						{
							shell: true,
							stdio: 'inherit',
						},
					)
				} catch (error) {
					console.error(error)
				}
			}
		} catch (error) {
			console.error(error)
		}
	},
	{},
)
