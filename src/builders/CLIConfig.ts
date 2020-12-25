import { CLIConfigObject } from '../types'

class CLIConfig implements CLIConfigObject {
	server: {
		dir: string | string[]
	}

	setServerPath() {}
}

export default CLIConfig
