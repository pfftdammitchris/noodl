import createServer from '../src/server'

createServer({
	serverDir: 'server',
	docsDir: 'src/server/graphql/**/*.graphql',
	port: 3001,
	host: '127.0.0.1',
	protocol: 'http',
})
