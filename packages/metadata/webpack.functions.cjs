// import dotenv from 'dotenv'
// dotenv.config()
// import nodeExternals from 'webpack-node-externals'
require('dotenv').config()
const nodeExternals = require('webpack-node-externals')
const fs = require('fs-extra')

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

/**
 * @type { import('webpack').Configuration}
 */
module.exports = {
  entry: ['./post.cjs'],
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
}
