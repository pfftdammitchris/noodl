const path = require('path')
const webpack = require('webpack')
const NoodlWebpackPlugin = require('.')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const srcDir = path.join(__dirname, './example')
const publicDir = path.join(srcDir, 'public')

/** @type { import('webpack-dev-server').Configuration } */
const devServerOptions = {
	clientLogLevel: 'info',
	compress: false,
	contentBase: [srcDir],
	host: '127.0.0.1',
	hot: true,
	liveReload: true,
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
		path: publicDir,
	},
	devServer: devServerOptions,
	devtool: 'inline-source-map',
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				include: srcDir,
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
		alias: {
			fs: path.resolve(__dirname, './node_modules/fs-extra'),
		},
		extensions: ['.ts', '.js'],
		modules: ['node_modules'],
	},
	plugins: [
		new NoodlWebpackPlugin({
			config: 'meet4d',
			serverDir: '../../server',
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			path: path.resolve(__dirname, './example/public'),
		}),
		new webpack.ProgressPlugin({
			percentBy: 'entries',
		}),
	],
}
