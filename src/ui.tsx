import React from 'react'
import Spinner from 'ink-spinner'
import { Newline, Static, Text } from 'ink'
import { Provider } from './useCtx'
import { panelId } from './constants'
import { PanelId } from './types'
import Settings from './panels/Settings'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import HighlightedText from './components/HighlightedText'
import useApp from './useApp'

const panels = {
	[panelId.SELECT_ROUTE]: SelectRoute,
	[panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[panelId.START_SERVER]: StartServer,
}

function App() {
	const appCtx = useApp()

	const Panel = panels[appCtx.panel.id as PanelId]

	return (
		<Provider value={appCtx}>
			<Newline />
			<Settings />
			{appCtx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={appCtx.spinner as any} />
				</HighlightedText>
			) : null}
			<Panel />
			<Static items={appCtx.caption as string[]}>
				{(caption) => <Text key={caption}>{caption}</Text>}
			</Static>
		</Provider>
	)
}

export default App
