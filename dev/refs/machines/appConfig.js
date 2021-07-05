const nc = require('noodl-common')
const xs = require('xstate')
const yaml = require('yaml')
const fs = require('fs-extra')
const path = require('path')

/**
 * @param { yaml.Document<any> } rootConfigDoc
 */
const createAppConfigMachine = function () {
	return xs.createMachine({
		id: `app-config-machine`,
		initial: 'loading',
		context: { rootConfig: null, appConfig: null },
		states: {
			loading: {
				target: 'loaded',
				invoke: {
					src: async ({ aggregator }) => {
						console.log({ aggregator })
						return aggregator.loadAppConfig()
					},
					onDone: {
						target: 'loaded',
						actions: xs.assign({
							context: {
								appConfig: (ctx, { data }) => data,
							},
						}),
					},
				},
			},
			loaded: {
				type: 'final',
			},
		},
	})
}

module.exports = createAppConfigMachine
