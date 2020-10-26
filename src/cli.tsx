#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import fs from 'fs'
import meow from 'meow'
import App from './ui'

const cli = meow(
	`
	Usage
	  $ noodl-cli

	Options
		--name  Your name

	Examples
	  $ noodl-cli --name=Jane
	  Hello, Jane
`,
	{
		flags: {
			name: {
				type: 'string',
			},
		},
	},
)

render(<App cli={cli} />)
