import * as u from '@jsmanifest/utils'
import execa from 'execa'
import meow from 'meow'
import path from 'path'
import rimraf from 'rimraf'

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
		const paths = [
			path.resolve(path.join(process.cwd(), `packages/${name}/src/*.js`)),
			path.resolve(path.join(process.cwd(), `packages/${name}/src/*.js.map`)),
			path.resolve(path.join(process.cwd(), `packages/${name}/src/*.d.ts`)),
		]
		for (const p of paths) {
			console.log(`[${u.cyan('running')}] on path: ${u.yellow(p)}`)
			rimraf(p, function (err) {
				if (err) u.throwError(err)
			})
		}
	}

	if (name === 'all') {
		u.forEach(({ name }) => rm(name), u.values(lib))
	} else {
		rm(name)
	}
}
