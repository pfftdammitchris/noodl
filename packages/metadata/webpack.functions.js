// import dotenv from 'dotenv'
// dotenv.config()
// import nodeExternals from 'webpack-node-externals'
require('dotenv').config()
const nodeExternals = require('webpack-node-externals')

console.log('HELLOASFSAFAS')

/** @type { import('webpack').Configuration } */

const config = {
  entry: './src/*.ts',
  externals: [nodeExternals()],
  mode: 'development',
  optimization: { minimize: false },
  devServer: {
    proxy: {
      '/.netlify': {
        target: 'http://127.0.0.1:3001',
        pathRewrite: { '^/.netlify/functions': '' },
      },
    },
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: 'babel-loader',
      //   options: {
      //     plugins: ['@babel/plugin-transform-runtime'],
      //     presets: ['@babel/preset-typescript'],
      //   },
      // },
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        // include: ['node_modules/noodl-aggregator/dist/index.js'],
        options: {
          loader: 'ts', // Or 'ts' if you don't need tsx
          target: 'es2020',
        },
      },
    ],
  },
}

module.exports = config
