const path = require('path')
const webpack = require('webpack')

const srcDir = path.resolve(path.join(__dirname, 'src'))

/** @type { import('webpack-dev-server').Configuration } */
const devServerOptions = {
	clientLogLevel: 'info',
	compress: false,
	contentBase: [srcDir],
	host: '127.0.0.1',
	hot: true,
	liveReload: true,
}

//

const compiler = webpack({
	entry: {
		main: path.resolve(__dirname, 'example/index.ts'),
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				include: path.join(__dirname, 'src'),
				use: [
					{
						loader: 'esbuild-loader',
						options: {
							loader: 'ts',
							target: 'es2016',
						},
					},
				],
			},
			//
		],
	},
	output: {
		path: path.resolve(path.join(__dirname, 'dist')),
	},
	plugins: [
		new (require('./dist/noodl-webpack-plugin'))({
			config: 'meet4d',
			deviceType: 'web',
			env: 'test',
			hostname: '127.0.0.1',
			version: 'latest',
			serverDir: '../../server',
			serverPort: 3001,
		}),
	],
	resolve: {
		extensions: ['.ts', '.js'],
	},
})

compiler.run((err) => {
	if (err) {
		throw new Error(err.message)
	} else {
		console.log(`Ran webpack compiler`)
		compiler.close((err) => {
			if (err) throw new Error(err)
			else console.log(`Webpack compiler has closed`)
		})
	}
})
