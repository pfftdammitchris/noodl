import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import esbuild from 'rollup-plugin-esbuild'

const extensions = ['.js', '.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @type { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		input: 'src/index.ts',
		output: [
			{
				dir: './dist',
				exports: 'named',
				format: 'esm',
				name: 'noodl',
				sourcemap: true,
			},
		],
		plugins: [
			json(),
			commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
				preferBuiltins: true,
			}),
			esbuild({
				include: /\.[jt]s?$/,
				exclude: /node_modules/,
				minify: !_DEV_,
				target: 'es2018',
				sourceMap: true,
			}),
		],
	},
]

export default configs
