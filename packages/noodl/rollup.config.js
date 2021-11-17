import { nodeResolve } from '@rollup/plugin-node-resolve'
import polyfills from 'rollup-plugin-polyfill-node'
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
		input: 'src/index.ts',
		output: [
			{
				dir: './dist',
				exports: 'named',
				format: 'umd',
				name: 'noodl',
				exports: 'auto',
				sourcemap: true,
			},
		],
		context: 'global',
		plugins: [
			json(),
			polyfills(),
			nodeResolve({
				browser: false,
				extensions,
				moduleDirectories: ['node_modules'],
				preferBuiltins: false,
			}),
			commonjs(),
			filesize(),
			progress(),
			esbuild({
				experimentalBundling: true,
				include: /\.[jt]s?$/,
				exclude: /node_modules/,
				minify: !_DEV_,
				target: 'es2020',
				sourceMap: true,
			}),
			{
				banner: `import { createRequire as topLevelCreateRequire } from "module";
const require = topLevelCreateRequire(import.meta.url);`,
			},
		],

		context: 'global',
	},
]

export default configs
