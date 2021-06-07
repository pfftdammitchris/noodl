const u = require('@jsmanifest/utils')
const execa = require('execa')
const meow = require('meow')
const path = require('path')

const cli = meow(``, {
	flags: {
		docs: { alias: 'd', type: 'string' },
	},
})

const getAbsFilePath = (...s) => path.resolve(path.join(...s))

const paths = {
	docs: getAbsFilePath('packages/docs'),
}

const { docs } = cli.flags

if (docs) {
	const pkg = require('./packages/docs/package.json')
	const scriptCmds = u.keys(pkg.scripts)
	const cmd = scriptCmds.includes(docs) ? `npm run ${docs}` : docs
	execa.commandSync(`lerna exec --scope noodl-cli-docs "${cmd}"`, {
		cwd: getAbsFilePath(paths.docs),
		shell: true,
		stdio: 'inherit',
	})
}
