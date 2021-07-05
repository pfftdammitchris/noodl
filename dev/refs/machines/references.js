const nc = require('noodl-common')
const xs = require('xstate')
const yaml = require('yaml')
const fs = require('fs-extra')
const path = require('path')

const rootConfigDoc = nc.loadFile('./generated/meet4d/meet4d.yml', 'doc')

const versionMachine = xs.createMachine({
	id: 'version',
	context: { deviceType: '', env: '' },
	initial: 'parse',
	states: {
		parse: {
			type: 'final',
			invoke: {
				src: (ctx, opts) => {
					return 'abc'
				},
			},
		},
	},
})

/**
 * @param { yaml.Document<any> } doc
 * @param { object } opts
 * @param { string } opts.config
 * @param { string } opts.deviceType
 * @param { string } opts.version
 */
const createReferencesMachine = function (
	doc,
	{ config, deviceType = 'web', env = 'test', version = 'latest' },
) {
	return xs.createMachine(
		{
			id: `${config}-references`,
			initial: 'init',
			context: {
				baseUrl: '',
				deviceType,
				env,
				version: '',
			},
			states: {
        init: {
          on: {
            ROOT_CONFIG: {
              actions: {
                
              }
            }
          }
        }
				parse: {
					on: {
						PARSE_VERSION: {
							actions: 'parseVersion',
						},
						PARSE_BASE_URL: {
							actions: 'parseBaseUrl',
						},
					},
					parsed: {
						type: 'final',
					},
				},
			},
		},
		{
			actions: {
				parseVersion: (ctx) =>
					(ctx.version = doc.getIn([deviceType, 'cadlVersion', env])),
				parseBaseUrl: (ctx) => (ctx.baseUrl = doc.get('cadlBaseUrl')),
			},
		},
	)
}

const rootConfigMachine = createReferencesMachine(rootConfigDoc, {
	config: 'meet4d',
})

const service = xs.interpret(rootConfigMachine)
service.start()
service.send('PARSE_VERSION')
service.send('PARSE_BASE_URL')
// service.start()
console.log(service.state.value)
console.log(rootConfigMachine.context)

module.exports = createReferencesMachine
