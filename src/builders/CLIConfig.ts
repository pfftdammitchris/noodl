import merge from 'lodash/merge'
import yaml from 'yaml'
import fs from 'fs-extra'
import { getAbsFilePath, getCliConfig } from '../utils/common'

class CliConfig {
	#state = {} as {
		defaultOption?: string
		defaultPanel?: string
		panels: Record<string, { component: String; label: string }>
		objects: {
			json: {
				dir: string[]
			}
			yml: {
				dir: string[]
			}
		}
		server: {
			host: string
			dir: string
			port: string | number
			protocol: string
			config: string
		}
		regex: {
			packages: Record<string, string>
		}
	}

	static filename = 'noodl.yml'

	constructor() {
		merge(this.#state, getCliConfig())
	}

	get serverUrl() {
		return (
			`${this.state.server.protocol}://` +
			`${this.state.server.host}:${this.state.server.port}`
		)
	}

	get state() {
		return this.#state
	}

	set state(state) {
		this.save(merge(this.#state, state))
	}

	save(opts?: Partial<CliConfig['state']>) {
		fs.writeFileSync(
			getAbsFilePath(CliConfig.filename),
			yaml.stringify({ ...this.toJSON(), ...opts }),
		)
		return getCliConfig()
	}

	toJSON() {
		return { ...this.state }
	}

	toString() {
		return JSON.stringify(this.toJSON(), null, 2)
	}
}

export default CliConfig
