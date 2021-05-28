import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box, Newline, Spacer, Text } from 'ink'
import Panel from '../../components/Panel'
import useCtx from '../../useCtx'

function GetApp() {
	const { log } = useCtx()

	React.useEffect(() => {
		log(`[GetApp]`)
	}, [])

	return (
		<Panel header="Scaffold your config">
			<Spacer />
			<Text>Hello!</Text>
			<Spacer />
		</Panel>
	)
}

export default GetApp
