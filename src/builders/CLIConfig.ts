import merge from 'lodash/merge'
import yaml from 'yaml'
import fs from 'fs-extra'
import { getAbsFilePath, getCliConfig } from '../utils/common'

class CliConfig {
	#state = {
		defaultOption: null,
		defaultPanel: null,
		objects: {
			json: { dir: [] },
			yml: { dir: [] },
		},
	}

	static filename = 'noodl.yml'

	constructor() {
		merge(this.#state, getCliConfig())
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
