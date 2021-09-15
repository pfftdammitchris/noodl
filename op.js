import * as u from '@jsmanifest/utils'
import execa from 'execa'
import meow from 'meow'
import path from 'path'

const getAbsFilePath = (...s) => path.resolve(path.join(...s))

const lib = {
	cli: { name: 'noodl-cli', path: getAbsFilePath('packages/noodl-cli') },
	noodl: { name: 'noodl', path: getAbsFilePath('packages/noodl') },
	nag: {
		name: 'noodl-aggregator',
		path: getAbsFilePath('packages/noodl-aggregator'),
	},
	nac: {
		name: 'noodl-action-chain',
		path: getAbsFilePath(`packages/noodl-action-chain`),
	},
	nc: { name: 'noodl-common', path: getAbsFilePath('packages/noodl-common') },
	nt: { name: 'noodl-types', path: getAbsFilePath('packages/noodl-types') },
	nu: { name: 'noodl-utils', path: getAbsFilePath('packages/noodl-utils') },
}

const cli = meow(``, {
	flags: {
		cli: { type: 'string' },
		noodl: { type: 'string' },
		nag: { type: 'string' },
		nac: { type: 'string' },
		nc: { type: 'string' },
		nt: { type: 'string' },
		nu: { type: 'string' },
		rmjs: { type: 'string' },
	},
})

if (cli.flags.rmjs) {
	const { rmjs: name } = cli.flags

	function rm(name) {
		let cmd = `npx lerna exec --scope ${name} `
		cmd += `'`
		cmd += `src/**.*.js `
		cmd += `src/**.*.js.map `
		cmd += `src/**.*.d.ts`
		cmd += `'`
		execa.commandSync(cmd, {
			cwd: path.resolve(path.join(process.cwd(), `packages`, name)),
			shell: true,
			stdio: 'inherit',
		})
	}

	if (name === 'all') {
		u.forEach((name) => rm(name), u.keys(lib))
	} else {
		rm(name)
	}
}
