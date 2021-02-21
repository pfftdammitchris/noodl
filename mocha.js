// const register = require('@babel/register').default
const babel = require('@babel/core')
const fs = require('fs-extra')
const Mocha = require('mocha')
const chalk = require('chalk')
const path = require('path')
const globby = require('globby')

// register({ extensions: ['.ts'] })

const pkgDir = {
	NOODL: 'packages/noodl',
	NOODL_TYPES: 'packages/noodl-types',
}

const outputPath = path.resolve(path.join(pkgDir.NOODL, 'dist/abc.js'))

const args = process.argv.slice(2)

console.log(`ARGS: ${chalk.cyan(args)}`)

const testFiles = globby.sync(path.join(pkgDir.NOODL, 'src/**/*.test.ts'))

console.log(testFiles)

const mocha = new Mocha({
	color: true,
	diff: true,
	fullTrace: true,
})

const transformedCode = babel.transformFileSync(testFiles[0], {
	cwd: path.resolve(path.join(pkgDir.NOODL, 'src')),
	filename: path.resolve(path.join(pkgDir.NOODL, 'src', 'abc.js')),
	filenameRelative: path.resolve(path.join(pkgDir.NOODL, 'src', 'abc.js')),
	include: ['packages/noodl/src/**/*.test.ts'],
	presets: ['@babel/preset-env', '@babel/preset-typescript'],
	plugins: [
		'lodash',
		'@babel/plugin-transform-runtime',
		['@babel/plugin-proposal-class-properties', { loose: true }],
		['@babel/plugin-proposal-private-methods', { loose: true }],
	],
	root: path.resolve(path.join(pkgDir.NOODL)),
})

fs.writeFileSync(outputPath, transformedCode.code, 'utf8')
mocha.addFile(outputPath)

// testFiles.forEach((file) => file.endsWith('.test.ts') && mocha.addFile(file))

mocha.checkLeaks()

// Run the tests.
mocha.run(function (failures) {
	process.exitCode = failures ? 1 : 0 // exit with non-zero status if there were failures
})
