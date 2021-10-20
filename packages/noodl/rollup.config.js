import { nodeResolve } from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import ts from 'rollup-plugin-ts'
// import visualizer from 'rollup-plugin-visualizer'

const extensions = ['.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @typedef { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		input: 'src/index.ts',
		output: [
			{
				dir: './dist',
				exports: 'named',
				format: 'umd',
				name: 'noodlui',
				globals: {},
				sourcemap: true,
			},
		],
		plugins: [
			nodePolyfills(),
			external(),
			commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				// browser: true,

				extensions,
				moduleDirectories: ['node_modules'],
				preferBuiltins: false,
			}),
			esbuild({
				include: /\.[t]s?$/,
				exclude: /node_modules/,
				// minify: !_DEV_,
				target: 'es2018',
			}),
			ts({
				transpileOnly: true,
			}),
		],
	},
]

export default configs
