import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import external from 'rollup-plugin-peer-deps-external'
import progress from 'rollup-plugin-progress'

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'cjs',
		sourcemap: 'inline',
	},
	plugins: [
		commonjs(),
		typescript(),
		filesize(),
		external(),
		progress(),
		resolve(),
		babel({
			babelHelpers: 'runtime',
			exclude: ['node_modules/**/*'],
			extensions: ['.ts'],
			presets: ['@babel/env', '@babel/typescript'],
			plugins: [
				'lodash',
				'@babel/proposal-class-properties',
				'@babel/plugin-proposal-private-methods',
				'@babel/proposal-object-rest-spread',
				'@babel/plugin-transform-runtime',
			],
		}),
	],
}
