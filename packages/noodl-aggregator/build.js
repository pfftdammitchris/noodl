const u = require('@jsmanifest/utils')
const esbuild = require('esbuild')
const meow = require('meow')

const cli = meow('', {
	flags: {
		watch: { alias: 'w', type: 'boolean' },
	},
})

const { watch } = cli.flags

const tag = `[${u.cyan('noodl-aggregator')}]`

/** @type { esbuild.BuildOptions } */

const options = {
	bundle: true,
	entryPoints: ['./src/index.ts'],
	format: 'cjs',
	logLevel: 'debug',
	outdir: `dist`,
	platform: 'node',
	sourcemap: true,
	target: 'es2015',
	external: ['node:*'],
}

//

if (watch) {
	options.watch = {
		onRebuild(err) {
			if (err) {
				console.log(`[${u.yellow(err.name)}] ${u.red(err.message)}`, err.stack)
			} else {
				console.log(`${tag} rebuilt`)
			}
		},
	}
}

esbuild
	.build(options)
	.then(async (buildResult) => {
		u.newline()
		console.log(tag, buildResult)
		u.newline()
	})
	.catch(console.error)
