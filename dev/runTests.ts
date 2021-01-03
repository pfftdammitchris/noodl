process.env.TS_NODE_PROJECT = 'tsconfig.test.json'
import('ts-mocha')
import fs from 'fs-extra'
import Mocha from 'mocha'

const mocha = new Mocha({
	checkLeaks: true,
	color: true,
	fullStackTrace: true,
	rootHooks: {
		beforeAll() {},
		afterAll() {},
		beforeEach() {},
		afterEach() {},
	},
	inlineDiffs: true,
	// parallel: true,
	reporter: 'list',
	ui: 'bdd',
})

mocha.parallelMode(true)

mocha.globalSetup((done) => {
	//
})

mocha.addFile(`./dev/dev.test.ts`)

mocha
	.run((failures) => {
		process.on('exit', () => {
			process.exit(failures) // exit with non-zero status if there were failures
		})
	})
	.on('pass', (test) => {
		//
	})
	.on('fail', (test, err) => {
		//
	})
	.on('pending', (test) => {
		//
	})
	.on('start', () => {
		//
	})
	.on('hook', (hook) => {
		//
	})
	.on('hook end', (hook) => {
		//
	})
	.on('test', (test) => {
		//
	})
	.on('test end', (test) => {
		//
	})
	.on('suite', (suite) => {
		//
	})
	.on('suite end', (suite) => {
		//
	})
	.on('end', () => {
		//
	})
