#!/usr/bin/env node
import { config } from 'dotenv'
config()
import React from 'react'
import meow from 'meow'
import { render } from 'ink'
import App from './App'
// import pkg from '../package.json'

const cli = meow(
	`
	Usage
	  $ noodl

	Options
		-c <config>

	Examples
	  $ noodl --c=noodl.json
`,
	{
		flags: {
			name: {
				type: 'string',
			},
		},
	},
)

console.log(cli.help)
console.log(cli.input)
console.log(cli.flags)

render(<App config={cli.flags?.c as string} />)
