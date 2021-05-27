import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box, Newline, Text } from 'ink'
import Panel from '../../components/Panel'
import useCtx from '../../useCtx'

export interface GetAppProps {}

function GetApp(props: GetAppProps) {
	const { log } = useCtx()

	React.useEffect(() => {
		log(`[GetApp]`)
		log(`[GetApp]`)
		log(`[GetApp]`)
	}, [])

	return (
		<Panel header="Scaffold your config">
			<Text>Hello!</Text>
		</Panel>
	)
}

export default GetApp
