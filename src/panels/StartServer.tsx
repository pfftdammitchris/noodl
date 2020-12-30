import React from 'react'
import { Box, Text } from 'ink'
import fs from 'fs-extra'
import useCtx from '../useCtx'
import { getFilePath } from '../utils/common'

const initialState = {
	//
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		default:
			return state
	}
}

function StartServer() {
	const [config, setConfig] = React.useState('')
	const { server } = useCtx()

	React.useEffect(() => {
		if (fs.existsSync(getFilePath(server.dir))) {
			const dirFiles = fs.readdirSync(getFilePath(server.dir), 'utf8')
		} else {
			// Confirm to create server dir
		}
	}, [])

	return (
		<Box flexDirection="column">
			<Text>Start server</Text>
		</Box>
	)
}

export default StartServer
