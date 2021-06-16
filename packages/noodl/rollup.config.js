import { DEFAULT_EXTENSIONS } from '@babel/core'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'

const extensions = [...DEFAULT_EXTENSIONS, '.ts']

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		exports: 'named',
		format: 'umd',
		name: 'noodl',
		sourcemap: true,
	},
	plugins: [
		filesize(),
		external(),
		progress(),
		resolve({
			extensions,
			moduleDirectories: ['node_modules'],
		}),
		typescript({
			rollupCommonJSResolveHack: true,
			check: false,
			abortOnError: false,
			clean: true,
		}),
		babel({
			babelHelpers: 'runtime',
			exclude: ['node_modules'],
			include: ['src/**/*'],
			extensions: ['.js'],
		}),
	],
}
