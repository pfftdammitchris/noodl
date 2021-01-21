import React from 'react'
import Spinner from 'ink-spinner'
import { Newline, Static, Text } from 'ink'
import { Provider } from './useCtx'
import { PanelId } from './types'
import Settings from './panels/Settings'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import HighlightedText from './components/HighlightedText'
import useApp from './useApp'
import * as c from './constants'

const panels = {
	[c.panelId.SELECT_ROUTE]: SelectRoute,
	[c.panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[c.panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[c.panelId.SERVER]: StartServer,
}

function App() {
	const appCtx = useApp()
	const Panel = panels[appCtx.panel.id as PanelId]

	const defaultSettings = {
		server: {
			dir: c.DEFAULT_SERVER_PATH,
			host: c.DEFAULT_SERVER_HOSTNAME,
			port: c.DEFAULT_SERVER_PORT,
			protocol: c.DEFAULT_SERVER_PROTOCOL,
		},
		objects: {
			hostname: c.DEFAULT_CONFIG_HOSTNAME,
			json: { dir: [] },
			yml: { dir: [] },
		},
	}

	return (
		<Provider value={appCtx}>
			<Newline />
			<Settings defaults={defaultSettings} />
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
