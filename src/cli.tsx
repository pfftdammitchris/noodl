#!/usr/bin/env node
process.stdout.write('\x1Bc')
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import App from './App'
import {
	DEFAULT_GENERATE_DIR,
	DEFAULT_SERVER_PORT,
	DEFAULT_SERVER_HOSTNAME,
} from './constants'
import * as co from './utils/color'

export type Cli = typeof cli

const tag = {
	$: co.white(`$`),
	noodl: co.purple(`noodl`),
}

const cli = meow(
	// prettier-ignore
	`
	${co.aquamarine('Usage')}
	  ${tag.$} ${tag.noodl} <input>

	${co.aquamarine(`Examples`)}
	  ${tag.$} ${tag.noodl} -c testpage (use testpage config for every operation)
	  ${tag.$} ${tag.noodl} --generatePath '../cadl/output' (changes path to generated files)

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
			generatePath: { type: 'string', default: DEFAULT_GENERATE_DIR },
			host: { alias: 'h', type: 'string', default: DEFAULT_SERVER_HOSTNAME },
			local: { type: 'boolean', default: false },
			port: { type: 'number', alias: 'p', default: DEFAULT_SERVER_PORT },
			retrieve: { type: 'string', alias: 'r', isMultiple: true },
			server: { type: 'boolean' },
			start: { type: 'string' },
			script: { type: 'string', alias: 's' },
			version: { type: 'string', alias: 'v', default: 'latest' },
			watch: { type: 'boolean', default: true },
			wss: { type: 'boolean', default: false },
		},
	},
)

render(<App cli={cli} />)
