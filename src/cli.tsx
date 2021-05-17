#!/usr/bin/env node
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import { aquamarine, white } from './utils/common'
import App from './App'
import { Ext } from './panels/RetrieveObjects'
import { App as IApp } from './types'

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
			panel: { type: 'string', alias: 'p' },
			retrieve: { type: 'string', alias: 'r' },
			server: { type: 'boolean', alias: 's' },
		},
	},
)

console.log(cli.help)
console.log(cli.flags)

render(
	<App
		cli={cli}
		config={cli.flags.config}
		defaultPanel={cli.flags.panel as IApp.PanelId}
		runServer={cli.flags.server}
		ext={(['ext', 'json'] as Ext[]).find((ext) => cli.input.includes(ext))}
	/>,
)
