const u = require('@jsmanifest/utils')
const nc = require('noodl-common')
const xs = require('xstate')
const yaml = require('yaml')
const fs = require('fs-extra')
const path = require('path')
const Aggregator = require('noodl-aggregator').default
const createAppConfigMachine = require('./appConfig')

/**
 * @param { object } opts
 * @param { import('noodl-aggregator').default } opts.aggregator
 * @param { string } opts.config
 * @param { string } opts.deviceType
 * @param { string } opts.version
 */
const createAppMachineFactory = function ({
	aggregator = new Aggregator(),
	config,
	deviceType = 'web',
	env = 'test',
	version = 'latest',
}) {
	/**
	 * @param { string | import('noodl-types').RootConfig | yaml.Document<any> } baseConfig
	 */
	function createAppMachine(baseConfig) {
		return xs.createMachine({
			id: `${config}-references`,
			initial: 'init',
			context: {
				rootConfig: {},
				appConfig: {},
				baseUrl: '',
				version: '',
			},
			entry() {
				aggregator.configKey = config
				aggregator.deviceType = deviceType
				aggregator.env = env
				aggregator.version = version
			},
			states: {
				init: {
					on: {
						LOAD: {
							initial: 'loading',
							states: {
								loading: {
									invoke: {
										src: async () => {
											if (u.isStr(baseConfig)) {
												if (baseConfig.startsWith('http')) {
													return aggregator.loadRootConfig()
												} else {
													return nc.loadFile(baseConfig, 'doc')
												}
											}
											if (yaml.isDocument(baseConfig)) {
												return baseConfig
											}
											if (u.isObj(baseConfig)) {
												return yaml.parseDocument(yaml.stringify(baseConfig))
											}
											throw new Error(
												`baseConfig is not a string, yaml document or object literal. Received type: "${typeof baseConfig}"`,
											)
										},
										onDone: {
											target: 'loaded',
											actions: xs.assign({
												rootConfig: (_, { data }) => data,
												appConfig: (_, { data }) =>
													xs.spawn(
														createAppConfigMachine().withContext({
															aggregator,
															rootConfig: data,
														}),
													),
											}),
										},
										onError: {
											target: 'loadFailed',
										},
									},
								},
								loaded: {
									type: 'final',
								},
								loadFailed: {
									type: 'final',
								},
							},
						},
					},
				},
			},
		})
	}

	return createAppMachine
}

module.exports = createAppMachineFactory
