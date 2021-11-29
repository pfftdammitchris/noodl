import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import esbuild from 'rollup-plugin-esbuild'
import nodePolyfills from 'rollup-plugin-polyfill-node'

const extensions = ['.js', '.ts']
const _DEV_ = process.env.NODE_ENV === 'development'

/**
 * @type { import('rollup').RollupOptions }
 */
const config = {
  input: 'src/noodl.ts',
  shimMissingExports: true,
  output: [
    {
      dir: 'dist',
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'Noodl',
    },
  ],
  plugins: [
    json(),
    nodePolyfills(),
    nodeResolve({
      extensions,
      moduleDirectories: ['node_modules'],
      preferBuiltins: true,
    }),
    esbuild({
      include: /\.[jt]s?$/,
      exclude: /node_modules/,
      minify: !_DEV_,
      target: 'es2018',
      sourceMap: true,
    }),
    commonjs(),
    filesize(),
    progress(),
  ],
  context: 'global',
}

export default config
