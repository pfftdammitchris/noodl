#!/usr/bin/env node
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import App from './ui'
// import pkg from '../package.json'

// @ts-expect-error
const cli = meow(
	`
	Usage
	  $ noodl-cli

	Options
		--c <directory>

	Examples
	  $ noodl-cli --c=noodlrc.json
	  Using noodlrc.json as the main config
`,
	{
		flags: {
			name: {
				type: 'string',
			},
		},
	},
)

render(<App />)
