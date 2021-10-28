import { nodeResolve } from '@rollup/plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'

const extensions = ['.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @typedef { import('rollup').RollupOptions[] }
 */
const configs = [
	{
		input: 'src/pdfdocs.ts',
		output: [
			// {
			// 	file: './dist/pdfdocs.cjs.js',
			// 	format: 'cjs',
			// 	name: 'pdfdocs',
			// 	sourcemap: true,
			// 	exports: 'named',
			// },
			// {
			// 	file: './dist/pdfdocs.es.js',
			// 	format: 'esm',
			// 	name: 'pdfdocs',
			// 	sourcemap: true,
			// 	exports: 'named',
			// },
			{
				file: './dist/pdfdocs.umd.js',
				format: 'umd',
				name: 'pdfdocs',
				sourcemap: true,
				globals: {
					pdfdocs: 'PdfDocs',
				},
			},
		],
		plugins: [
			external(),
			commonjs(),
			filesize(),
			progress(),
			nodeResolve({
				browser: true,
				extensions,
				moduleDirectories: ['node_modules'],
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
