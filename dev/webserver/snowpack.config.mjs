// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration
import path from 'path'

const baseDir = path.resolve(path.join(process.cwd(), 'dev/webserver'))
const publicDir = path.join(baseDir, 'public')

console.log({ baseDir, publicDir })

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
	mount: {
		public: { url: '/', static: true },
		src: { url: '/' },
	},
	knownEntrypoints: [],
	plugins: [
		/* ... */
	],
	packageOptions: {
		polyfillNode: true,
	},
	// routes: [{ match: 'routes', src: '.*', dest: '/index.html' }],
	devOptions: {
		open: 'none',
		hostname: '127.0.0.1',
		port: 3000,
	},
	buildOptions: {
		baseUrl: '/',
		clean: true,
		sourcemap: true,
		out: './dist',
	},
}
