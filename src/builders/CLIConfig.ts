import yaml from 'yaml'
import { App } from '../types'
import { saveYml } from '../utils/common'
import * as c from '../constants'

class CLIConfig implements App.CliConfigObject {
	defaultOption = null
	defaultPanel = null
	objects = {
		json: { dir: [] },
		yml: { dir: [] },
	}
	server = {
		host: c.DEFAULT_SERVER_HOSTNAME,
		dir: c.DEFAULT_SERVER_PATH,
		port: c.DEFAULT_SERVER_PORT,
		protocol: c.DEFAULT_SERVER_PROTOCOL,
		config: c.DEFAULT_CONFIG,
	}

	get serverUrl() {
		return `${this.server.protocol}://${this.server.host}:${this.server.port}`
	}

	save(opts?: Partial<App.CliConfigObject>) {
		saveYml('noodl.yml', yaml.stringify({ ...this.toJSON(), ...opts }))
	}

	toJSON() {
		return {
			defaultOption: this.defaultOption,
			defaultPanel: this.defaultPanel,
			objects: this.objects,
			server: this.server,
		}
	}

	toString() {
		return JSON.stringify({ server: this.server }, null, 2)
	}
}

export default CLIConfig
