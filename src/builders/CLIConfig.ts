import merge from 'lodash/merge'
import { CLIConfigObject } from '../types'
import { getFilePath } from '../utils/common'

const DEFAULT_JSON_OBJECTS_DIR = getFilePath('objects/json')
const DEFAULT_YML_OBJECTS_DIR = getFilePath('objects/yml')

class CLIConfig {
	server = {
		host: 'http://127.0.0.1',
		dir: getFilePath('server'),
		port: 3000,
	}
	objects = {
		json: { dir: [] as string[] },
		yml: { dir: [] as string[] },
	}

	constructor(opts?: Partial<CLIConfigObject>) {
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
				this.objects.json.dir.push(DEFAULT_JSON_OBJECTS_DIR)
			}
			if (!this.objects.yml.dir.length) {
				this.objects.yml.dir.push(DEFAULT_YML_OBJECTS_DIR)
			}
		}
	}

	insertExtDir(ext: 'json' | 'yml', dirs: string | string[] | undefined) {
		if (dirs) {
			dirs = Array.isArray(dirs) ? dirs : [dirs]
			dirs.forEach((d) => {
				if (!this.objects[ext].dir.includes(d)) {
					this.objects[ext].dir.push(d)
				}
			})
		}
		return this
	}

	getServerDir() {
		return this.server.dir
	}

	getServerUrl() {
		if (!this.server.host) return ''
		const url = new URL(this.server.host)
		url.port = String(this.server.port)
		return url.toString()
	}

	getServerPort() {
		return this.server.port
	}

	setServerDir(pathToFolder: string) {
		this.server.dir = getFilePath(pathToFolder)
		return this
	}

	setServerBaseUrl(host: string) {
		this.server.host = host
		return this
	}

	setServerPort(port: number) {
		this.server.port = port
		return this
	}

	setJsonObjectsDir(pathToFolder: string | string[]) {
		if (typeof pathToFolder === 'string') {
			this.objects.json.dir.push(pathToFolder)
		} else if (Array.isArray(pathToFolder)) {
			pathToFolder.forEach((p) => this.objects.json.dir.push(p))
		}
		return this
	}

	setYmlObjectsDir(pathToFolder: string | string[]) {
		if (typeof pathToFolder === 'string') {
			this.objects.yml.dir.push(pathToFolder)
		} else if (Array.isArray(pathToFolder)) {
			pathToFolder.forEach((p) => this.objects.yml.dir.push(p))
		}
		return this
	}

	toJS() {
		return {
			objects: this.objects,
			server: {
				...this.server,
				url: this.getServerUrl(),
			},
		} as CLIConfigObject
	}

	toString() {
		return JSON.stringify(this.toJS(), null, 2)
	}
}

export default CLIConfig
