const u = require('@jsmanifest/utils')
const esbuild = require('esbuild')
const meow = require('meow')

const cli = meow('', {
	flags: {
		watch: { alias: 'w', type: 'boolean' },
	},
})

const { watch } = cli.flags

const tag = `[${u.cyan('noodl-common')}]`

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

esbuild
	.build(options)
	.then(async (buildResult) => {
		u.newline()
		console.log(tag, buildResult)
		u.newline()

		// const project = new ts.Project()
		// const sourceFiles = project.addSourceFilesFromTsConfig('tsconfig.json')
		// await project.save()
		// const emitResult = await project.emit({
		// 	emitOnlyDtsFiles: true,
		// })

		// console.log(emitResult.getDiagnostics())

		// return execa.command(`tsc${watch ? ' -w' : ''}`, {
		// 	shell: true,
		// })
	})
	.catch(console.error)
