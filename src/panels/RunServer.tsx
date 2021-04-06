import React from 'react'
import useCtx from '../useCtx'

function RunServer() {
	const { settings } = useCtx()

	React.useEffect(() => {
		import('../server').then(({ default: createServer }) => {
			createServer({
				serverDir: settings.server.dir,
				host: settings.server.host,
				port: settings.server.port,
				protocol: settings.server.protocol,
				config: settings.server.config as string,
			})
		})
	}, [])

	return null
}

export default RunServer
