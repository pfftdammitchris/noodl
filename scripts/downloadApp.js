console.clear()
import * as u from '@jsmanifest/utils'
import path from 'path'
import execa from 'execa'
import cron from 'node-cron'
import yaml from 'yaml'
import fs from 'fs-extra'

const CONFIG_PATH = path.resolve(path.join(process.cwd(), 'config.yml'))
const LOGS_DIR = path.resolve(path.join(process.cwd(), 'logs'))
const LOG_PATH = path.join(LOGS_DIR, 'downloadApp.json')
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
	)}\n`,
)

const INITIAL_CONFIG = 'admind2'

if (!fs.existsSync(CONFIG_PATH)) {
	fs.ensureFileSync(CONFIG_PATH)
	u.log(`Created missing config file at ${u.yellow(CONFIG_PATH)}`)
}

if (!fs.existsSync(LOGS_DIR)) {
	fs.ensureDirSync(LOGS_DIR)
	u.log(`Created missing logs directory at ${u.yellow(LOGS_DIR)}`)
}

if (!fs.existsSync(LOG_PATH)) {
	fs.writeJsonSync(LOG_PATH, {})
	u.log(`Created missing log file at ${u.yellow(LOG_PATH)}`)
}

const config = yaml.parseDocument(fs.readFileSync(CONFIG_PATH, 'utf8'))
const logFile = fs.readJsonSync(LOG_PATH)

if (!('executions' in logFile)) {
	logFile.executions = []
	fs.writeJsonSync(LOG_PATH, logFile, { spaces: 2 })
}

if (!config.has('apps')) {
	const initialValue = new yaml.YAMLSeq()
	initialValue.add(INITIAL_CONFIG)
	config.set('apps', initialValue)
	fs.writeFileSync(CONFIG_PATH, yaml.stringify(config, { indent: 2 }), 'utf8')
}

const apps = config.get('apps')?.toJSON?.() || []

u.newline()

console.log({ apps, previousExecutions: logFile.executions?.length || 0 })

u.newline()

cron.schedule(
	schedule,
	async () => {
		try {
			u.log(`${u.white(u.bold(`Executing (${new Date().toISOString()})`))}\n`)

			const success = []
			const failed = []

			for (const appName of apps) {
				try {
					await execa.command(
						`noodl -c ${appName} -g app --out generated --remote`,
						{
							shell: true,
							stdio: 'inherit',
						},
					)
					success.push(appName)
				} catch (error) {
					console.error(error)
					failed.push(appName)
				}

				if (!u.isArr(logFile.executions)) logFile.executions = []

				logFile.executions.push({
					timestamp: Date.now(),
					apps,
					success,
					failed,
				})
			}
		} catch (error) {
			console.error(error)
		}
	},
	{},
)
