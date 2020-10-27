import React from 'react'
// import meow from 'meow'
import {
	Box,
	Newline,
	render,
	Spacer,
	Static,
	Text,
	Transform,
	useInput,
	useStdin,
	useStdout,
} from 'ink'
import BigText from 'ink-big-text'
import ConfirmInput from 'ink-confirm-input'
import Divider from 'ink-divider'
import Spinner from 'ink-spinner'
import ProgressBar from 'ink-progress-bar'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import App from './ui'

// const cli = meow(
// 	`
// 	Usage
// 	  $ noodl-cli

// 	Options
// 		--name  Your name

// 	Examples
// 	  $ noodl-cli --name=Jane
// 	  Hello, Jane
// `,
// 	{
// 		flags: {
// 			name: {
// 				type: 'string',
// 			},
// 		},
// 	},
// )

render(<App />)
