process.env.TS_NODE_PROJECT = './tsconfig.test.json'
process.env.TS_CONFIG_PATHS = true
process.env.NODE_ENV = 'test'
require('ts-mocha')
const Mocha = require('mocha')
const path = require('path')
const globby = require('globby')
const chalk = require('chalk').default
const { Command } = require('commander')

const log = console.log

const paths = {
	noodl: 'packages/noodl',
	noodlCommon: 'packages/noodl-common',
	noodlTypes: 'packages/noodl-types',
	noodlActionChain: 'packages/noodl-action-chain',
}

const program = new Command()

program
	.option('-f --file <file>', 'target a single file')
	.option('-n --tname <tname>', "load a predefined test under a test's name")

program.parse(process.argv)

const options = program.opts()
const files = [] // { name, filepath }[]

console.log('-------------------------------------------------------')
console.log(
	`# of arguments: ${chalk.keyword('aquamarine')(program.args.length)}`,
)
console.log(`name: ${chalk.keyword('aquamarine')(program.name())}`)
console.log('options', options)
console.log('-------------------------------------------------------\n')

const mocha = new Mocha({ color: true })
mocha.enableGlobalSetup(true)
mocha.globalSetup(() => {
	require(path.resolve(paths.noodlActionChain, 'src/setupTests.ts'))
})

const getGlobbyPaths = (name) => {
	switch (name) {
		case 'ac':
			return path.join(paths.noodlActionChain, 'src/**/*.test.ts')
		case 'noodl':
			return path.join(paths.noodl, 'src/**/*.test.ts')
		default:
			throw new Error('Invalid test name')
	}
}

const globbedPaths = globby.sync(getGlobbyPaths(options.tname), {
	onlyFiles: true,
	stats: true,
})

globbedPaths.forEach(({ name, path: filepath }) => {
	files.push({ name, filepath })
	log(`Adding file: ${chalk.magenta(filepath)}`)
	mocha.addFile(filepath)
})

const runner = mocha.run((failures) => {
	process.on('exit', () => {
		process.exit(failures)
	})

	process.exit(failures)
})

// runner.on('pass', (test) => {
// 	log(`Test passed: ${test.title}`)
// })

// runner.on('fail', (test) => {
// 	log(`Test failed: ${test.title}`)
// })

// runner.on('start', () => {
// 	log('Starting unit tests...')
// })

// runner.on('suite', (suite) => {
// 	log(`Running suite: ${suite.title}`)
// })

// runner.on('suite end', (suite) => {
// 	log(`Suite was run: ${suite.titlePath}`)
// })

// runner.on('test', (test) => {
// 	log(`Starting test: ${test.title}`)
// 	log({ passed: test.isPassed, failed: test.isFailed })
// })

// runner.on('test end', (test) => {
// 	log(`Test was run: ${test.titlePath}`)
// })
