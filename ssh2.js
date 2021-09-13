import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import ssh2 from 'ssh2'
import chalk from 'chalk'

const coolGold = (s = '') => chalk.keyword('navajowhite')(s)
const toString = (chunk) => chunk.toString?.().replace(/\n/g, '')?.trim?.()
const tag = (s = '') => `[${u.cyan(s)}]`

const client = new ssh2.Client()
const privateKey = fs.readFileSync('../Downloads/ecos-noodl.pem')

client.connect({
	username: 'ubuntu',
	host: 'ec2-54-219-91-202.us-west-1.compute.amazonaws.com',
	privateKey,
	compress: true,
})

client.on('connect', () => {
	console.log(`${tag('connect')} Connected`)
})

client.on('ready', () => {
	console.log(`${tag('ready')} ssh2 client is ready`)

	process.stdout.addListener('data', () => {
		console.clear()
	})

	const shouldWaitBeforeSendingTraffic = client.exec(
		'sudo su',
		{ pty: { columns: 110, width: 1000, height: 500 } },
		function callback(err, channel) {
			if (err) {
				console.log(`[${u.yellow(err.name || 'Error')}] ${u.red(err.message)}`)
			} else {
				const ctag = (s = '') =>
					`[${u.white(u.bold('channel'))}-${coolGold(s)}]`

				channel.stdout.addListener(
					'data',
					/** @param { Buffer } chunk */
					function (chunk) {
						console.log(toString(chunk))
					},
				)

				channel.addListener('error', (err) => {
					console.error(
						`${ctag('error')} [${u.yellow(err.name)}] ${u.red(err.message)}`,
					)
				})

				channel.addListener('close', () => {
					console.log(ctag('close'))
				})

				channel.addListener('end', () => {
					console.log(ctag('end'))
				})

				channel.addListener('pause', () => {
					console.log(ctag('pause'))
				})

				channel.addListener('resume', () => {
					console.log(ctag('resume'))
				})
			}

			process.stdout.on('data', (chunk) => {
				channel.write(toString(chunk) + '\n', (err) => {
					if (err) {
						console.error(`[${u.red('stdout')}] ${toString(chunk)}`)
					}
				})
			})
		},
	)
})

client.on('greeting', (greeting) => {
	console.log(`${tag('greeting')} ${greeting}`)
})

client.on('error', (err) => {
	console.error(`[${u.yellow(err.name)}] ${u.red(err.message)}`)
})

client.on('close', () => {
	console.log(`${tag('close')} Closed`)
})

client.on('tcp connection', (details, accept, reject) => {
	console.log(`${tag('tcp connection')}`, details)
})
