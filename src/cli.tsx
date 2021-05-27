#!/usr/bin/env node
process.stdout.write('\x1Bc')
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import { aquamarine, cyan, white } from './utils/common'
import App from './App'

export type Cli = typeof cli

const cli = meow(
	`
	${aquamarine('Usage')}
	  ${white('$')} noodl <input>

	${aquamarine(`Examples`)}
	  ${white('$')} noodl -c testpage

	${aquamarine(`Options`)}
	  ${white(`--config`)}, ${white(`-c`)} NOODL config
`,
	{
		flags: {
			config: { type: 'string', alias: 'c' },
			fetch: { type: 'boolean', alias: 'f' },
			panel: { type: 'string', alias: 'p' },
			retrieve: { type: 'string', alias: 'r', isMultiple: true },
			server: { type: 'boolean', alias: 's' },
			start: { type: 'string' },
		},
	},
)

console.log(cyan(`Flags: `), cli.flags)
console.log(cyan(`Input: `), cli.input || [])

render(<App cli={cli} />)
