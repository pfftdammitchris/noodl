import { CliConfigObject } from '../types'
import * as c from '../constants'

class CLIConfig implements CliConfigObject {
	defaultOption = null
	server = {
		host: c.DEFAULT_SERVER_HOSTNAME,
		dir: c.DEFAULT_SERVER_PATH,
		port: c.DEFAULT_SERVER_PORT,
		protocol: c.DEFAULT_SERVER_PROTOCOL,
		config: c.DEFAULT_CONFIG,
	}
	objects = {
		json: { dir: [] },
		yml: { dir: [] },
	}

	get serverUrl() {
		return `${this.server.protocol}://${this.server.host}:${this.server.port}`
	}

	toJS() {
		return {
			defaultOption: this.defaultOption,
			objects: this.objects,
			server: this.server,
		}
	}

	toString() {
		return JSON.stringify({ server: this.server }, null, 2)
	}
}

export default CLIConfig
