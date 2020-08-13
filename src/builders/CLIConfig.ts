import { CLIConfigObject } from '../types'
import { getFilePath } from '../utils/common'

class CLIConfig {
	server = {
		baseUrl: '',
		dir: '',
		port: 3000,
	}
	objects = {
		json: { dir: [] as string[] },
		yml: { dir: [] as string[] },
	}

	constructor(opts?: Partial<CLIConfigObject>) {
		if (opts) {
			if (opts.server) {
				Object.entries(opts.server).forEach(
					([k, v]) => ((this.server as any)[k] = v),
				)
			}
			this.insertExtDir('json', opts.objects?.json.dir)
			this.insertExtDir('yml', opts.objects?.yml.dir)
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
		if (!this.server.baseUrl) return ''
		const url = new URL(this.server.baseUrl)
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

	setServerBaseUrl(baseUrl: string) {
		this.server.baseUrl = baseUrl
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
		}
	}

	toString() {
		return JSON.stringify(this.toJS(), null, 2)
	}
}

export default CLIConfig