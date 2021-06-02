import * as u from '@jsmanifest/utils'
import invariant from 'invariant'
import merge from 'lodash/merge'
import path from 'path'
import React from 'react'
import produce, { Draft } from 'immer'
import { Box, Static, Text, useApp } from 'ink'
import { Provider } from './useCtx'
import createAggregator from './api/createAggregator'
import HighlightedText from './components/HighlightedText'
import Spinner from './components/Spinner'
import Settings from './panels/Settings'
import GenerateApp from './panels/GenerateApp'
import Server from './panels/Server'
import * as co from './utils/color'
import * as c from './constants'
import * as t from './types'

const aggregator: ReturnType<typeof createAggregator> = createAggregator()

export const initialState = {
	ready: false,
	activePanel: '' as t.App.PanelKey,
	highlightedPanel: '' as t.App.PanelKey,
	spinner: false as false | string,
	text: [] as string[],
}

function Application({
	cli,
	config,
	settings,
}: {
	cli: t.App.Context['cli']
	config: t.App.Config
	settings: t.App.Settings
}) {
	const [state, _setState] = React.useState<t.App.State>(initialState)
	const { exit } = useApp()

	const set = React.useCallback(
		(
			fn:
				| ((draft: Draft<t.App.State>) => void)
				| Partial<t.App.State>
				| t.App.PanelKey,
		) =>
			void _setState(
				produce((draft) => {
					if (u.isStr(fn)) draft.activePanel = fn
					else if (u.isFnc(fn)) fn(draft)
					else if (u.isObj(fn)) merge(draft, fn)
				}),
			),
		[],
	)

	const ctx: t.App.Context = {
		...state,
		aggregator,
		config,
		cli,
		exit,
		getGenerateDir: (configKey: string = cli.flags.config || '') =>
			path.join(settings.get(c.GENERATE_DIR_KEY), configKey),
		set,
		highlight: (id) => set((d) => void (d.highlightedPanel = id)),
		log: (text) => set((d) => void d.text.push(text)),
		logError: (err) =>
			set(
				(d) =>
					void d.text.push(
						err instanceof Error
							? `[${u.red(err.name)}]: ${u.yellow(err.message)}`
							: err,
					),
			),
		toggleSpinner: (type) =>
			set(
				(d) =>
					void (d.spinner = u.isUnd(type)
						? 'point'
						: type === false
						? false
						: type),
			),
		setPanel: (panelKey: t.App.PanelKey | '') => {
			set((d) => void (d.activePanel = panelKey))
		},
		settings,
	}

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const handleGenerate = () => {
				const generate = cli.flags.generate as string
				if (generate === 'app') {
					ctx.setPanel('generateApp')
				} else {
					u.log(
						co.red(
							`Invalid generate operation: "${co.white(generate)}"\n` +
								`Supported options are: ${co.yellow('app')}\n`,
						),
					)
					exit()
				}
			}

			const handleServer = () => {
				invariant(
					!!cli.flags.config,
					`Cannot run server without specifing a config via ${co.yellow(
						`--config`,
					)} or ${co.yellow(`-c`)}`,
				)
				ctx.setPanel('server')
			}

			if (cli.flags.generate) handleGenerate()
			else if (cli.flags.server) handleServer()
			else ctx.setPanel(c.DEFAULT_PANEL)
		} else {
			ctx.setPanel(c.DEFAULT_PANEL)
		}
	}, [])

	return (
		<Provider value={ctx}>
			<Box flexDirection="column">
				{
					!state.ready ? (
						<Settings
							onReady={() =>
								set({ ready: true, activePanel: state.activePanel })
							}
						/>
					) : state.activePanel === 'generateApp' ? (
						<GenerateApp
							config={cli.flags.config}
							configVersion={cli.flags.version}
							deviceType={cli.flags.device}
							env={cli.flags.env}
							isLocal={cli.flags.local}
						/>
					) : state.activePanel === 'server' ? (
						<Server config={cli.flags.config as string} wss={cli.flags.wss} />
					) : null
					// <RetrieveObjects
					// 		onEnd={() => {
					// 			if (state.panel.runServer || cli.flags.server) {
					// 				ctx.update(c.panel.RUN_SERVER.key, {
					// 					idle: true,
					// 					mounted: false,
					// 				})
					// 			}
					// 		}}
					// 	/>
					// ) : state.activePanel === c.panel.FETCH_SERVER_FILES.key ? (
					// 	<GetServerFiles
					// 		onDownloadedAssets={() =>
					// 			cli.flags.server &&
					// 			set((d) => void (d.activePanel = c.panel.RUN_SERVER.key))
					// 		}
					// 	/>
					// ) : state.activePanel === c.panel.RUN_SERVER.key ? (
					// 	<RunServer />
					// ) : (
					// 	<SelectRoute />
					// )
				}
				<Static items={ctx.text as string[]}>
					{(text, index) => <Text key={index}>{text}</Text>}
				</Static>
				{ctx.spinner ? (
					<HighlightedText color="whiteBright">
						<Spinner type={ctx.spinner} />
					</HighlightedText>
				) : null}
			</Box>
		</Provider>
	)
}

export default Application
