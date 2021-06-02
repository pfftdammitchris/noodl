#!/usr/bin/env node
process.stdout.write('\x1Bc')
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()
import React from 'react'
import meow from 'meow'
import ConfigStore from 'configstore'
import { render } from 'ink'
import App from './App'
import * as co from './utils/color'
import * as com from './utils/common'
import * as t from './types'

export type Cli = typeof cli

const cli = meow(
	`
	${co.aquamarine('Usage')}
	  ${co.white('$')} noodl <input>

	${co.aquamarine(`Examples`)}
	  ${co.white('$')} noodl -c testpage

	${co.aquamarine(`Options`)}
	  ${co.white(`--config`)}, ${co.white(`-c`)} NOODL config
`,
	{
		flags: {
			config: { type: 'string', alias: 'c' },
			device: { type: 'string', default: 'web' },
			env: { type: 'string', alias: 'e', default: 'test' },
			fetch: { type: 'boolean', alias: 'f' },
			generate: { type: 'string', alias: 'g' },
			local: { type: 'boolean', default: false },
			panel: { type: 'string', alias: 'p' },
			retrieve: { type: 'string', alias: 'r', isMultiple: true },
			server: { type: 'boolean' },
			start: { type: 'string' },
			script: { type: 'string', alias: 's' },
			version: { type: 'string', alias: 'v', default: 'latest' },
		},
	},
)

const config = com
	.loadFileAsDoc(com.getAbsFilePath('config.yml'))
	.toJSON() as t.App.Config

console.log('')
console.log(co.cyan(`Input: `), cli.input || [])
console.log(co.cyan(`Flags: `), cli.flags)
console.log('')

const settings = new ConfigStore('noodl-cli', undefined, {
	globalConfigPath: true,
})

render(<App cli={cli} config={config} settings={settings} />)
