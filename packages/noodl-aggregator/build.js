import * as u from '@jsmanifest/utils'
import esbuild from 'esbuild'
import meow from 'meow'

const cli = meow('', {
	flags: {
		format: { alias: 'f', type: 'string', default: 'esm' },
		watch: { alias: 'w', type: 'boolean' },
	},
	importMeta: import.meta,
})

const { format, watch } = cli.flags

const tag = `[${u.magenta(format)} ${u.cyan('noodl-aggregator')}]`

/** @type { esbuild.BuildOptions } */

const options = {
	bundle: true,
	minify: true,
	entryPoints: ['./src/index.ts'],
	format,
	logLevel: 'debug',
	outdir: `dist${format === 'cjs' ? '/cjs' : ''}`,
	platform: 'node',
	sourcemap: true,
	target: format === 'cjs' ? 'es2017' : 'es2020',
	external: ['fs', 'path'],
}

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

const buildResult = await esbuild.build(options)

u.newline()
u.log(tag, buildResult)
u.newline()
