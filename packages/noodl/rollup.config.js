import { nodeResolve } from '@rollup/plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
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
			commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				extensions,
				moduleDirectories: ['node_modules'],
				preferBuiltins: true,
			}),
			babel({
				babelHelpers: 'runtime',
				presets: ['@babel/preset-env'],
				plugins: ['babel-plugin-lodash', '@babel/plugin-transform-runtime'],
			}),
			esbuild({
				include: /\.[t]s?$/,
				exclude: /node_modules/,
				minify: !_DEV_,
				target: 'es2018',
				sourceMap: true,
			}),
		],
	},
]

export default configs
