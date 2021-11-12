import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import babel from '@rollup/plugin-babel'
import esbuild from 'rollup-plugin-esbuild'
import nodePolyfills from 'rollup-plugin-polyfill-node'

const extensions = ['.js', '.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @type { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		cache: false,
		input: 'src/index.ts',
		output: [
			{
				file: './dist/noodl.js',
				format: 'esm',
				name: 'noodl',
				exports: 'named',
				sourcemap: true,
			},
		],
		plugins: [
			json(),
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
				preferBuiltins: true,
			}),
			nodePolyfills(),
			commonjs({
				include: /node_modules/,
			}),
			filesize(),
			progress(),
			babel({
				extensions: ['.js'],
				babelHelpers: 'runtime',
				presets: ['@babel/preset-env'],
				plugins: ['@babel/transform-runtime'],
			}),
			esbuild({
				include: /\.[jt]s?$/,
				exclude: /node_modules/,
				minify: !_DEV_,
				target: 'es2018',
				sourceMap: true,
			}),
		],
		context: 'global',
	},
]

export default configs
