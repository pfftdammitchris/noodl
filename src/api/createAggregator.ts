import axios from 'axios'
import yaml from 'yaml'
import RootConfig from '../builders/RootConfig'
import AppConfig from '../builders/AppConfig'

export interface ConfigOptions {
	config?: string
	host?: string
	version?: string | number
}

const createAggregator = function (opts: ConfigOptions) {
	const api = {
		rootConfig: null,
		appConfig: null,
	}
	let config = opts.config || 'aitmed'
	let host = opts.host || 'public.aitmed.com'

	const objects = {
		json: {},
		yml: {},
	}

	const o = {
		async init() {
			api.rootConfig = await new RootConfig()
			objects.json[config] = await new RootConfig()
				.setConfig(config)
				.setHost(host)
				.setVersion(opts.version || 'latest')
				.build()
			objects.yml[config] = objects.json[config].yml
			objects.json['cadlEndpoint'] = await new AppConfig()
				.setRootConfig(objects.json[config])
				.build()
			return [objects.json[config], objects.json['cadlEndpoint']]
		},
	}

	return o
}

export default createAggregator
