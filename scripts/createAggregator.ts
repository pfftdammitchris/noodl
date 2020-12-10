import axios from 'axios'
import yaml from 'yaml'

export interface ConfigOptions {
	env: 'stable' | 'test'
	config: string
	baseUrl: string
}

const createAggregator = function (opts: ConfigOptions) {
	const
	const objects = {
		json: {},
		yml: {},
	}
	const configOptions = {
		env: opts.env || 'test',
		name: opts.name || 'aitmed.yml',
		baseUrl: opts.baseUrl || 'https://public.aitmed.com/config',
	}

	const o = {
		async init(url?: string) {
			const [] = await Promise.all([_loadRootConfig(), _loadAppConfig()])
			return (await axios.get(url || this.getBaseUrl())).data
		},
		getBaseUrl() {
			return `${configOptions.baseUrl}/${configOptions.name}.yml`
		},
	}

	async function _loadRootConfig() {
		const { data: yml } = await axios.get(o.getBaseUrl())
		const json = yaml.parse(yml)
		objects.json[configOptions.name] = json
		objects.yml[configOptions.name] = yml
		return json
	}

	async function _loadAppConfig(
		baseUrl: string = objects.json[configOptions.name].baseUrl,
	) {
		const { data: yml } = await axios.get(baseUrl)
		const json = yaml.parse(yml)
		objects.json[app] = json
		objects.yml[app] = yml
		return json
	}

	return o
}

export default createAggregator
