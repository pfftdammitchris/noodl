import { nodeResolve } from '@rollup/plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import esbuild from 'rollup-plugin-esbuild'
import pkg from './package.json'

const extensions = ['.js', '.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @type { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		cache: true,
		input: 'src/index.ts',
		output: [
			{
				file: `./dist/noodl-utils.iife.js`,
				format: 'iife',
				name: 'noodlUtils',
				sourcemap: true,
				globals: {},
			},
			{
				file: pkg.exports.import,
				exports: 'named',
				format: 'es',
				sourcemap: true,
			},
			{
				file: pkg.exports.require,
				exports: 'named',
				format: 'cjs',
				sourcemap: true,
			},
		],
		plugins: [
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
			}),
			filesize(),
			progress(),
			esbuild({
				include: /\.ts?$/,
				exclude: /node_modules/,
				minify: !_DEV_,
				target: 'es2018',
				sourceMap: true,
			}),
		],
	},
]

export default configs
