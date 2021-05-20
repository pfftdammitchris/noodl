const path = require('path')
const webpack = require('webpack')
const NoodlWebpackPlugin = require('.').default

// const NodePolyfillsPlugin = require('node-polyfill-webpack-plugin')
const srcDir = path.join(__dirname, './example')
const publicDir = path.join(srcDir, 'public')

/** @type { import('webpack-dev-server').Configuration } */
const devServerOptions = {
	clientLogLevel: 'info',
	compress: false,
	contentBase: [srcDir],
	host: '127.0.0.1',
	hot: false,
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
		publicPath: publicDir,
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
		fallback: {
			constants: require.resolve('constants-browserify'),
			path: require.resolve('path-browserify'),
			os: require.resolve('os-browserify/browser'),
			stream: require.resolve('stream-browserify'),
		},
		modules: ['node_modules'],
	},
	recordsPath: path.join(__dirname, 'records.json'),
	plugins: [
		// new NodePolyfillsPlugin(),
		new webpack.ProvidePlugin({
			process: 'process',
		}),
		new NoodlWebpackPlugin({
			config: 'meet4d',
		}),
		// new HtmlWebpackPlugin({
		// 	publicPath: path.join(__dirname, './example/public'),
		// }),
		new webpack.ProgressPlugin({
			percentBy: 'entries',
		}),
	],
}
