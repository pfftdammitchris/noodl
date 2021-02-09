import React from 'react'
import cliConfig from '../cliConfig'

function RunServer() {
	React.useEffect(() => {
		import('../server').then(({ default: createServer }) => {
			createServer({
				serverDir: cliConfig.server.dir,
				host: cliConfig.server.host,
				port: cliConfig.server.port,
				protocol: cliConfig.server.protocol,
			})
		})
	}, [])

	return null
}

export default RunServer
