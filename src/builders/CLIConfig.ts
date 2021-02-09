import merge from 'lodash/merge'
import { CLIConfigObject } from '../types'
import { getFilePath } from '../utils/common'
import * as c from '../constants'

class CLIConfig implements CLIConfigObject {
	server = {
		host: c.DEFAULT_SERVER_HOSTNAME,
		dir: c.DEFAULT_SERVER_PATH,
		port: c.DEFAULT_SERVER_PORT,
		protocol: c.DEFAULT_SERVER_PROTOCOL,
		config: '',
	}
	objects = {
		hostname: c.DEFAULT_CONFIG_HOSTNAME,
		json: { dir: [] as string[] },
		yml: { dir: [] as string[] },
	}

	merge(opts?: Partial<CLIConfigObject>) {
		if (opts) {
			if (opts.server) {
				merge(this.server, opts.server)
			}
			if (opts.objects) {
				merge(this.objects, opts.objects, {
					json: {
						...this.objects.json,
						dir: this.objects.json.dir.concat(
							opts.objects?.json?.dir
								? Array.isArray(opts.objects?.json?.dir)
									? opts.objects?.json?.dir
									: [opts.objects?.json?.dir]
								: [],
						),
					},
					yml: {
						...this.objects.yml,
						dir: this.objects.yml.dir.concat(
							opts.objects?.yml?.dir
								? Array.isArray(opts.objects?.yml?.dir)
									? opts.objects?.yml?.dir
									: [opts.objects?.yml?.dir]
								: [],
						),
					},
				})
			}
			if (!this.objects.json.dir.length) {
				this.objects.json.dir.push(c.DEFAULT_JSON_OBJECTS_DIR)
			}
			if (!this.objects.yml.dir.length) {
				this.objects.yml.dir.push(c.DEFAULT_YML_OBJECTS_DIR)
			}
		}
	}

	serverDir(pathToFolder?: string) {
		if (pathToFolder) {
			this.server.dir = getFilePath(pathToFolder) || ''
			return this
		}
		return this.server.dir || ''
	}

	serverHost(host?: string) {
		if (host) {
			this.server.host = host
			return this
		}
		return this.server.host || ''
	}

	serverPort(port?: number) {
		if (port !== undefined) {
			this.server.port = Number(port)
			return this
		}
		return this.server.port
	}

	serverProtocol() {
		return this.server.protocol || ''
	}

	serverUrl() {
		return `${this.server.protocol || ''}://${this.server.host || ''}:${
			this.server.port || ''
		}`
	}

	toJS() {
		return {
			objects: this.objects,
			server: this.server,
		} as CLIConfigObject
	}

	toString() {
		return JSON.stringify(this.toJS(), null, 2)
	}
}

export default CLIConfig
