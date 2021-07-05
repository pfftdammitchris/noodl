const nc = require('noodl-common')
const xs = require('xstate')
const yaml = require('yaml')
const fs = require('fs-extra')
const path = require('path')

/**
 * @param { yaml.Document<any> } doc
 * @param { object } opts
 * @param { string } opts.config
 * @param { string } opts.deviceType
 * @param { string } opts.version
 */
const createRootConfigMachine = function (
	doc,
	{ config, deviceType = 'web', env = 'test', version = 'latest' },
) {
	return xs.createMachine({
		id: config,
		initial: 'loading',
		context: {
			version: '',
			baseUrl: '',
		},
		states: {
			loading: {
				invoke: {
					id: `loading-${config}`,
					// src: (ctx) =>
				},
			},
		},
	})
}

module.exports = createRootConfigMachine
