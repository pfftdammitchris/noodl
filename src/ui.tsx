import React from 'react'
import chalk from 'chalk'
import produce from 'immer'
import fs from 'fs-extra'
import { Static, Text } from 'ink'
import { WritableDraft } from 'immer/dist/internal'
import { Provider } from './useCtx'
import { panelId } from './constants'
import { Action, CLIConfigObject, Context, PanelId, State } from './types'
import { getFilePath } from './utils/common'
import createAggregator from './api/createAggregator'
import CLIConfigBuilder from './builders/CLIConfig'
import RetrieveObjects from './panels/RetrieveObjects'
import RetrieveKeywords from './panels/RetrieveKeywords'
import SelectRoute from './panels/SelectRoute'
import StartServer from './panels/StartServer'

const panels = {
	[panelId.INIT]: SelectRoute,
	[panelId.RETRIEVE_OBJECTS]: RetrieveObjects,
	[panelId.RETRIEVE_KEYWORDS]: RetrieveKeywords,
	[panelId.START_SERVER]: StartServer,
}

let aggregator: ReturnType<typeof createAggregator> = createAggregator()

const initialState: State = {
	caption: [],
	server: { url: '', dir: '' },
	objects: {
		json: { dirs: [] },
		yml: { dirs: [] },
	},
	panel: {
		id: panelId.INIT,
		label: 'Select a route',
	},
}

const reducer = produce(
	(draft: WritableDraft<State> = initialState, action: Action): void => {
		switch (action.type) {
			case 'set-caption':
				return void draft.caption.push(action.caption)
			case 'set-server-options':
				return void Object.assign(draft.server, action.options)
			case 'set-objects-json-options':
				return void Object.assign(draft.objects.json, action.options)
			case 'set-objects-yml-options':
				return void Object.assign(draft.objects.yml, action.options)
			case 'merge-to-panel':
				return void Object.keys(action.panel).forEach(
					(key) => (draft.panel[key] = action.panel[key]),
				)
		}
	},
)

function App() {
	const [state, dispatch] = React.useReducer(reducer, initialState)

	const ctx: Context = {
		...state,
		aggregator,
		mergeToPanel: React.useCallback((panel: any) => {
			dispatch({ type: 'merge-to-panel', panel })
		}, []),
		setCaption: React.useCallback((caption: string) => {
			dispatch({ type: 'set-caption', caption })
		}, []),
		setErrorCaption: React.useCallback((err: string | Error) => {
			dispatch({
				type: 'set-caption',
				caption:
					err instanceof Error
						? `[${chalk.red(err.name)}]: ${chalk.yellow(err.message)}`
						: err,
			})
		}, []),
	} as Context

	const Panel = panels[state?.panel.id as PanelId]

	React.useEffect(() => {
		const configPath = getFilePath('noodl.json')
		const configBuilder = new CLIConfigBuilder({
			server: {
				baseUrl: 'http://127.0.0.1',
				port: 3000,
				dir: getFilePath('server'),
			},
			objects: {
				json: { dir: getFilePath('data/objects/json') },
				yml: { dir: getFilePath('data/objects/yml') },
			},
		})
		if (!fs.existsSync(configPath)) {
			ctx.setCaption(
				chalk.red(
					'\nYou do not have a config yet. A default one was automatically ' +
						'created\n',
				),
			)
			fs.writeJsonSync(getFilePath('noodl.json'), configBuilder.toJS(), {
				spaces: 2,
			})
		}
		const consumerCliConfig = fs.readJsonSync('noodl.json') as CLIConfigObject
		if (consumerCliConfig) {
			console.log(
				chalk.green(
					`FOUND consumerCliConfig`,
					JSON.stringify(consumerCliConfig, null, 2),
				),
			)
			const { server, objects } = consumerCliConfig
			if (server?.baseUrl) configBuilder.setServerBaseUrl(server.baseUrl)
			if (server?.dir) configBuilder.setServerDir(server.dir)
			if (server?.port) configBuilder.setServerPort(server.port)
			configBuilder.insertExtDir('json', objects?.json?.dir)
			configBuilder.insertExtDir('yml', objects?.yml?.dir)
		}
		const result = configBuilder.toJS()
		dispatch({
			type: 'set-server-options',
			options: { url: result.server.url, dir: result.server.dir },
		})
		dispatch({
			type: 'set-objects-json-options',
			options: { dirs: result.objects.json.dir },
		})
		dispatch({
			type: 'set-objects-yml-options',
			options: { dirs: result.objects.yml.dir },
		})
	}, [])

	return (
		<Provider value={ctx}>
			<Panel />
			<Static items={state?.caption as string[]}>
				{(caption) => <Text key={caption}>{caption}</Text>}
			</Static>
		</Provider>
	)
}

export default App
