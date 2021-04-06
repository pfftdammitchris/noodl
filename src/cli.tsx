#!/usr/bin/env node
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import { aquamarine, white } from './utils/common'
import App from './App'

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
			server: { type: 'boolean', alias: 's' },
		},
	},
)

console.log(cli.help)

render(
	<App
		config={cli.flags.config}
		help={cli.help}
		runServer={cli.flags.server}
	/>,
)
