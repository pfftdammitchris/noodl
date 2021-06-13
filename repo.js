const u = require('@jsmanifest/utils')
const execa = require('execa')
const meow = require('meow')
const path = require('path')

const getAbsFilePath = (...s) => path.resolve(path.join(...s))

const lib = {
	docs: { name: 'noodl-cli-docs', path: getAbsFilePath('packages/docs') },
	nt: { name: 'noodl-types', path: getAbsFilePath('packages/noodl-types') },
	gen: { name: 'generator', path: getAbsFilePath('packages/generator') },
	nac: {
		name: 'noodl-action-chain',
		path: getAbsFilePath(`packages/noodl-action-chain`),
	},
}

const cli = meow(``, {
	flags: {
		docs: { alias: 'd', type: 'string' },
		gen: { alias: 'g', type: 'string' },
		nt: { type: 'string' },
		nac: { type: 'string' },
	},
})

const paths = {
	docs: getAbsFilePath('packages/docs'),
}

function run({ pkgPath, scriptCmd, scriptCmdValue }) {
	const pkg = require(pkgPath)
	const scriptCmds = u.keys(pkg.scripts)
	const cmd = scriptCmds.includes(scriptCmdValue)
		? `npm run ${scriptCmdValue}`
		: scriptCmdValue
	return execa.commandSync(
		`lerna exec --scope ${lib[scriptCmd].name} "${cmd}"`,
		{
			cwd: getAbsFilePath(paths.docs),
			shell: true,
			stdio: 'inherit',
		},
	)
}

for (const scriptCmd of u.keys(cli.flags)) {
	if (scriptCmd in lib) {
		const libObject = lib[scriptCmd]
		run({
			pkgPath: path.join(libObject.path, 'package.json'),
			scriptCmd,
			scriptCmdValue: cli.flags[scriptCmd],
		})
	} else {
		//
	}
}
