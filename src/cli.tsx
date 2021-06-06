#!/usr/bin/env node
process.stdout.write('\x1Bc')
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import App from './App'
import {
	DEFAULT_GENERATE_DIR,
	DEFAULT_SERVER_PORT,
	DEFAULT_SERVER_HOSTNAME,
	DEFAULT_WSS_PORT,
} from './constants'
import * as co from './utils/color'

export type Cli = typeof cli

const tag = {
	$: co.white(`$`),
	noodl: co.coolGold(`noodl`),
}
const header = (s: string) => co.fadedBlue(s)
const flag = (s: string) => co.magenta(s)

const cli = meow(
	// prettier-ignore
	`
	${header('Usage')}
	  ${tag.$} ${tag.noodl} <option>

	${header(`Options`)}
	  ${flag(`--config`)}, ${flag(`-c`)} Sets the config for operations
	  ${flag(`--device`)}, ${flag(`-d`)} Sets the device type (defaults to ${co.yellow('web')})
	  ${flag(`--env`)}, ${flag(`-e`)} Sets the noodl environment (defaults to ${co.yellow('test')})
	  ${flag(`--generate`)}, ${flag(`-g`)} Use this operation to generate all the files from ${co.yellow('--config')}
	  ${flag(`--generatePath`)}, Sets the path where files are generated
	  ${flag(`--host`)}, ${flag(`-h`)} Sets the server hostname (defaults to ${co.yellow('localhost')})
	  ${flag(`--local`)}, Sets base url to localhost. (defaults to false which points remotely to ${co.yellow('public.aitmed.com')})
	  ${flag(`--port`)}, ${flag(`-p`)} Sets the server port (defaults to ${co.yellow('3001')})
	  ${flag(`--server`)} Use this operation to run the server
	  ${flag(`--version`)}, ${flag(`-v`)} Retrieves config cersion using ${co.yellow('--device')} (defaults to ${co.yellow('latest')})
	  ${flag(`--watch`)} Watch for file changes (where yml files are)
	  ${flag(`--wss`)} Turns on auto reloading when editing yml files
	  ${flag(`--wssPort`)} Sets the port for the auto reload server (defaults to ${co.yellow('3002')})

	${header(`Examples`)}
	  ${tag.$} ${tag.noodl} ${flag('-c')} ${co.white('testpage')} (use testpage config for every operation)
	  ${tag.$} ${tag.noodl} ${flag('-c')} ${co.white('testpage')} ${flag('-g')} app (generate an entire app using the testpage config)
	  ${tag.$} ${tag.noodl} ${flag('--generatePath')} ${co.white('../cadl/output')} (puts generated files to this dir)
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
			server: { type: 'boolean' },
			start: { type: 'string' },
			script: { type: 'string', alias: 's' },
			version: { type: 'string', alias: 'v', default: 'latest' },
			watch: { type: 'boolean', default: true },
			wss: { type: 'boolean', default: false },
			wssPort: { type: 'number', default: DEFAULT_WSS_PORT },
		},
	},
)

render(<App cli={cli} />)
