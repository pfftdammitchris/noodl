// import dotenv from 'dotenv'
// dotenv.config()
// import nodeExternals from 'webpack-node-externals'
// require('esm')(module, { cjs: true })
require('dotenv').config()
const nodeExternals = require('webpack-node-externals')

console.log('HELLOASFSAFAS')

/** @type { import('webpack').Configuration } */

const config = {
  externals: [nodeExternals()],
  mode: 'development',
  resolve: {
    // extensions: ['.ts', '.js'],
    // modules: ['node_modules'],
    // fallback: {
    // 'node:fs': require.resolve('fs-extra'),
    // 'node:stream': require.resolve('stream'),
    // 'node:path': require.resolve('util'),
    // 'node:util': require.resolve('util'),
    // },
  },
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
      {
        test: /\.(ts)$/,
        loader: 'babel-loader',
        options: {
          plugins: ['@babel/plugin-transform-runtime'],
          presets: ['@babel/preset-typescript'],
        },
      },
      {
        test: /\.(ts)$/,
        loader: 'esbuild-loader',
        // include: ['node_modules/noodl-aggregator/dist/index.js'],
        options: {
          loader: 'ts', // Or 'ts' if you don't need tsx
          target: 'es2018',
        },
        // include: /noodl-aggregator/i,
      },
    ],
  },
}

module.exports = config
