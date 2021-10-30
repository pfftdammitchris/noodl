import { nodeResolve } from '@rollup/plugin-node-resolve'
// import nodePolyfills from 'rollup-plugin-node-polyfills'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'
// import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
// import visualizer from 'rollup-plugin-visualizer'

const extensions = ['.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @typedef { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		input: 'src/noodl.ts',
		output: [
			{
				file: './dist/noodl.cjs',
				exports: 'named',
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: './dist/noodl.mjs',
				exports: 'named',
				format: 'esm',
				sourcemap: true,
			},
		],
		plugins: [
			// nodePolyfills(),
			external(),
			// commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
			}),
			esbuild({
				include: /\.[t]s?$/,
				exclude: /node_modules/,
				sourceMap: true,
				target: 'es2018',
			}),
		],
	},
]

export default configs
