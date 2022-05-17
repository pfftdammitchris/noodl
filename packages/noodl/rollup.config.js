import path from 'path'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import esbuild from 'rollup-plugin-esbuild'

const getRelPath = (...s) => path.resolve(path.join(__dirname, ...s))

/**
 * @type { import('rollup').RollupOptions[] }
 */
const configs = [
  {
    input: 'src/noodl.ts',
    output: [
      {
        name: 'noodl',
        dir: './dist',
        format: 'umd',
        sourcemap: true,
      },
    ],
    plugins: [
      filesize(),
      progress(),
      esbuild({
        include: /\.[jt]s?$/,
        exclude: /node_modules/,
        target: 'es2015',
        loaders: { '.ts': 'ts' },
        sourceMap: false,
        // optimizeDeps: {
        //   esbuildOptions: {
        //     bundle: true,
        //   },
        //   include: [],
        // },
      }),
    ],
  },
]

export default configs
