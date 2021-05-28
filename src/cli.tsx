#!/usr/bin/env node
process.stdout.write('\x1Bc')
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import * as co from './utils/color'
import App from './App'
import CliConfig from './builders/CliConfig'

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
			fetch: { type: 'boolean', alias: 'f' },
			generate: { type: 'string', alias: 'g' },
			panel: { type: 'string', alias: 'p' },
			retrieve: { type: 'string', alias: 'r', isMultiple: true },
			server: { type: 'boolean' },
			start: { type: 'string' },
			script: { type: 'string', alias: 's' },
		},
	},
)

console.log(co.cyan(`Flags: `), cli.flags)
console.log(co.cyan(`Input: `), cli.input || [])
console.log('')

const cliConfig = new CliConfig()

const { cleanup, clear, rerender, unmount, waitUntilExit } = render(
	<App cli={cli} cliConfig={cliConfig} />,
)
