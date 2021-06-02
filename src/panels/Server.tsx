import React from 'react'
import useCtx from '../useCtx'

export interface Props {
	config: string
	wss?: boolean
}

function RunServer({ config: configProp, wss }: Props) {
	const { getGenerateDir } = useCtx()

	React.useEffect(() => {
		import('../server').then(({ default: createServer }) => {
			createServer({
				dir: getGenerateDir(configProp),
				host: `127.0.0.1`,
				port: 3001,
				config: configProp,
				wss,
			})
		})
	}, [])

	return null
}

export default RunServer
