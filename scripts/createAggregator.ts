import axios from 'axios'
import yaml from 'yaml'
import RootConfig from '../src/builders/RootConfig'
import AppConfig from '../src/builders/AppConfig'

export interface ConfigOptions {
	config?: string
	host?: string
	version?: string | number
}

const createAggregator = function (opts: ConfigOptions) {
	let config = opts.config || 'aitmed'
	let host = opts.host || 'public.aitmed.com'

	const objects = {
		json: {},
		yml: {},
	}

	const o = {
		async init() {
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
