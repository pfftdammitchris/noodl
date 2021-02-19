import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'

export default {
	input: 'src/noodl.ts',
	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: 'inline',
	},
	plugins: [
		typescript(),
		filesize(),
		external(),
		progress(),
		resolve({
			moduleDirectories: ['node_modules'],
		}),
		babel({
			babelHelpers: 'bundled',
			exclude: ['node_modules'],
			extensions: ['.ts'],
		}),
	],
}
