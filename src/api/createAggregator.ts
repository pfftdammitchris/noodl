import axios from 'axios'
import yaml from 'yaml'
import RootConfig from '../builders/RootConfig'
import AppConfig from '../builders/AppConfig'

export interface ConfigOptions {
	config?: string
	host?: string
	version?: string | number
}

const createAggregator = function (opts?: ConfigOptions) {
	const api = {
		rootConfig: null as any,
		appConfig: null as any,
	} as { rootConfig: RootConfig; appConfig: AppConfig }

	let config = opts?.config || 'aitmed'
	let host = opts?.host || 'public.aitmed.com'

	const objects = {
		json: {},
		yml: {},
	} as {
		json: { [key: string]: { [key: string]: any } }
		yml: { [key: string]: string }
	}

	const o = {
		setConfig(value: string) {
			config = value
			return o
		},
		setHost(value: string) {
			host = value
			return o
		},
		async init() {
			api.rootConfig = new RootConfig()
			api.appConfig = new AppConfig()
			objects.json[config] = await api.rootConfig
				.setConfig(config)
				.setHost(host)
				.setVersion(opts?.version || 'latest')
				.build()
			objects.yml[config] = objects.json[config]?.yml
			objects.json['cadlEndpoint'] = await api.appConfig
				.setRootConfig(objects.json[config] as any)
				.build()
			return [objects.json[config], objects.json['cadlEndpoint']]
		},
	}

	return o
}

export default createAggregator
