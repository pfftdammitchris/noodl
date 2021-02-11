import React from 'react'
import { Newline, Static, Text } from 'ink'
import { Provider } from './useCtx'
import { PanelId } from './types'
import SelectRoute from './panels/SelectRoute'
import ServerFiles from './panels/ServerFiles'
import RunServer from './panels/RunServer'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import HighlightedText from './components/HighlightedText'
import Spinner from './components/Spinner'
import useApp from './useApp'
import * as c from './constants'

const panels = {
	[c.panelId.SELECT_ROUTE]: SelectRoute,
	[c.panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[c.panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[c.panelId.SERVER_FILES]: ServerFiles,
	[c.panelId.RUN_SERVER]: RunServer,
}

function App() {
	const appCtx = useApp()
	const Panel = panels[appCtx.panel.id as PanelId]

	return (
		<Provider value={appCtx}>
			<Newline />
			{appCtx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={appCtx.spinner as any} />
				</HighlightedText>
			) : null}
			<Panel />
			<Static items={appCtx.caption as string[]}>
				{(caption, index) => <Text key={index}>{caption}</Text>}
			</Static>
		</Provider>
	)
}

export default App
