process.env.TS_NODE_PROJECT = 'tsconfig.test.json'
const register = require('@babel/register').default
const fs = require('fs')
const Mocha = require('mocha')
const babel = require('@babel/core')
const chalk = require('chalk')
const path = require('path')
const globby = require('globby')

register({ extensions: ['.ts'] })

const pkgDir = {
	NOODL: 'packages/noodl',
	NOODL_TYPES: 'packages/noodl-types',
}

const outputPath = path.resolve(path.join(__dirname, 'abc.js'))

const args = process.argv.slice(2)

console.log(`ARGS: ${chalk.cyan(args)}`)

const testFiles = globby.sync(
	path.resolve(path.join(pkgDir.NOODL, 'src/**/*.test.ts')),
)

console.log(testFiles)

const mocha = new Mocha({
	color: true,
	fullTrace: true,
})

const transformedCode = babel.transformFileSync(testFiles[0], {
	ignore: ['node_modules'],
	exclude: ['node_modules'],
	filename: outputPath,
	include: ['packages/noodl/src/**/*.test.ts'],
	presets: ['@babel/preset-env', '@babel/preset-typescript'],
	plugins: [
		'lodash',
		'@babel/plugin-transform-runtime',
		['@babel/plugin-proposal-class-properties', { loose: true }],
		['@babel/plugin-proposal-private-methods', { loose: true }],
	],
})

fs.writeFileSync(outputPath, transformedCode.code, 'utf8')

// testFiles.forEach((file) => file.endsWith('.ts') && mocha.addFile(file))
mocha.addFile(outputPath)

mocha.checkLeaks()
// Run the tests.
mocha.run(function (failures) {
	process.exitCode = failures ? 1 : 0 // exit with non-zero status if there were failures
})
