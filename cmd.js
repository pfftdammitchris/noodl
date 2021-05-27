const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const meow = require('meow')
const chokidar = require('chokidar')
const webpack = require('webpack')
const pkgJson = require('./package.json')

const cli = meow({
	flags: {
		build: { alias: 'b', type: 'boolean' },
		lerna: { alias: 'l', type: 'string' },
		start: { alias: 's', type: 'boolean' },
	},
})

/**
 * @param { (data: string) => (chunk: any) => void  } fn
 * @returns { (chunk: any) => void }
 */
const onData = (fn) => (chunk) =>
	fn(Buffer.isBuffer(chunk) ? chunk.toString() : chunk)

const {
	flags: { start },
	input,
} = cli

console.log(`Flags`, cli.flags)
console.log(`Input`, cli.input)

const [command, pkg] = input

if (command) {
	if (command === 'lerna') {
		if (/(wp$|wplugin)/i.test(pkg)) {
			if (start) {
				execa(
					`lerna`,
					['exec', '--scope', 'noodl-webpack-plugin', 'npm run start'],
					{ stdio: 'inherit', shell: true },
				)
			}
		} else if (/(wps|wpluginsample)/i.test(pkg)) {
			const webpackConfig = require(path.join(
				__dirname,
				'./packages/noodl-webpack-plugin/webpack.config',
			))

			console.info(webpackConfig)
			console.info(webpackConfig)
			console.info(webpackConfig)

			const compiler = webpack({})
			let shell = execa(
				`lerna`,
				['exec', '--scope', 'noodl-webpack-plugin', 'npm run sample'],
				{ shell: true },
			)
		}
	}
}
