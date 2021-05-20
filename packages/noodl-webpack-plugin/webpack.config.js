const path = require('path')
const webpack = require('webpack')
const NoodlWebpackPlugin = require('./dist/noodl-webpack-plugin')
const pkg = require('./package.json')

/** @type { import('webpack-dev-server').Configuration } */
const devServerOptions = {
	clientLogLevel: 'info',
	compress: false,
	contentBase: [path.join(__dirname, 'public')],
	host: '127.0.0.1',
	hot: true,
}

/**
 * @type { webpack.Configuration } webpackOptions
 */
module.exports = {
	entry: {
		main: './example/index.ts',
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'build'),
	},
	devServer: devServerOptions,
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				include: path.resolve(__dirname, 'example'),
				use: [
					{
						loader: 'esbuild-loader',
						options: {
							loader: 'ts', // Or 'ts' if you don't need tsx
							target: 'es2016',
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
		modules: ['node_modules'],
	},
	plugins: [new NoodlWebpackPlugin(), new webpack.ProgressPlugin()],
}
