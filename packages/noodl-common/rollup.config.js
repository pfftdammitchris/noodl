import { nodeResolve } from '@rollup/plugin-node-resolve'
// import nodePolyfills from 'rollup-plugin-node-polyfills'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
// import visualizer from 'rollup-plugin-visualizer'

const extensions = ['.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @type { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		input: 'src/index.ts',
		output: [
			{
				file: './dist/noodl-common.cjs',
				exports: 'named',
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: './dist/noodl-common.js',
				exports: 'named',
				format: 'esm',
				sourcemap: true,
			},
		],
		external: ['chalk', 'universalify', 'jsonfile/utils', 'globby'],
		plugins: [
			// nodePolyfills(),
			external(),
			commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
			}),
			esbuild({
				sourceMap: true,
				include: /\.[t]s?$/,
				exclude: /node_modules/,
				target: 'es2018',
			}),
		],
		treeshake: 'recommended',
	},
]

export default configs
