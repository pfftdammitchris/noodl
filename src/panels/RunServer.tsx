import React from 'react'
import useCtx from '../useCtx'

function RunServer() {
	const { cliConfig } = useCtx()

	React.useEffect(() => {
		import('../server').then(({ default: createServer }) => {
			createServer({
				serverDir: cliConfig.server.dir,
				host: cliConfig.server.host,
				port: cliConfig.server.port,
				protocol: cliConfig.server.protocol,
				config: cliConfig.server.config as string,
			})
		})
	}, [])

	return null
}

export default RunServer
