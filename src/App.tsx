import * as u from '@jsmanifest/utils'
import pick from 'lodash/pick'
import { LiteralUnion } from 'type-fest'
import invariant from 'invariant'
import yaml from 'yaml'
import React from 'react'
import produce, { Draft } from 'immer'
// import Gradient from 'ink-gradient'
// import ProgressBar from 'ink-progress-bar'
import { Spacer, Static, Text, Newline, useApp } from 'ink'
import { Provider } from './useCtx'
import createAggregator from './api/createAggregator'
import CliConfig from './builders/CliConfig'
import HighlightedText from './components/HighlightedText'
import Spinner from './components/Spinner'
import GetApp from './panels/GetApp'
// import RetrieveObjects from './panels/RetrieveObjects'
// import RunServer from './panels/RunServer'
// import SelectRoute from './panels/SelectRoute'
import * as com from './utils/common'
import * as co from './utils/color'
import * as c from './constants'
import * as t from './types'

export const AppPanel = {
	getApp: GetApp,
	// retrieveObjects: RetrieveObjects,
	// runServer: RunServer,
	// [c.DEFAULT_PANEL]: SelectRoute,
} as const

const aggregator: ReturnType<typeof createAggregator> = createAggregator()

export const initialState = {
	activePanel: '' as t.App.PanelKey,
	highlightedPanel: '' as t.App.PanelKey,
	spinner: false as false | string,
	text: [] as string[],
}

function Application({
	cli,
	cliConfig,
	config,
}: {
	cli: t.App.Context['cli']
	cliConfig: CliConfig
	config: t.App.Config
}) {
	const [mounted, setMounted] = React.useState(false)
	const [state, _setState] = React.useState<t.App.State>(initialState)

	const { exit } = useApp()

	const set = React.useCallback(
		(fn: (draft: Draft<t.App.State>) => void) => void _setState(produce(fn)),
		[],
	)

	const ctx: t.App.Context = {
		...state,
		aggregator,
		config,
		cli,
		cliConfig,
		exit,
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
			console.log('')
			if (panelKey in AppPanel) {
				let componentName = ''
				for (const key of u.keys(AppPanel)) {
					if (panelKey === key) {
						componentName = u.keys(AppPanel[key])[0]
						break
					}
				}
				panelKey in AppPanel &&
					ctx.log(
						`Panel is switching to ${u.cyan(panelKey)}: ${u.white(
							`<${componentName} />`,
						)}`,
					)
			}
			console.log('')
			set((d) => void (d.activePanel = panelKey))
		},
	}

	React.useEffect(() => {
		setMounted(true)
	}, [])

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const handleGenerate = () => {
				const generate = cli.flags.generate as string
				if (generate in AppPanel) {
					ctx.setPanel(generate)
				} else {
					u.log(
						co.red(
							`Invalid generate operation: "${co.white(generate)}"\n` +
								`Supported options are: ${co.yellow(
									u.keys(AppPanel).join(', '),
								)}\n`,
						),
					)
					exit()
				}
			}

			const handleScript = (script: string) => {
				if (script in state.panels) {
					ctx.setPanel(script)
				} else {
					ctx.log(`The script "${script}" does not exist`)
					ctx.setPanel(c.DEFAULT_PANEL)
				}
			}

			const handleRetrieve = () => {
				invariant(
					['json', 'yml'].some((ext) => cli.flags.retrieve?.includes(ext)),
					`Invalid value for "${co.magenta(
						`retrieve`,
					)}". Valid options are: ${co.magenta('json')}, ${co.magenta('yml')}`,
				)
				set((d) => void (d.activePanel = c.panel.FETCH_SERVER_FILES.key))
			}

			const handleServer = () => {
				if (cli.flags.fetch) {
					set((d) => void (d.activePanel = c.panel.FETCH_SERVER_FILES.key))
				} else {
					set((d) => void (d.activePanel = c.panel.RUN_SERVER.key))
				}
			}

			cli.flags.generate
				? handleGenerate()
				: cli.flags.script
				? handleScript(cli.flags.script)
				: cli.flags.retrieve
				? handleRetrieve()
				: cli.flags.server
				? handleServer()
				: undefined
		} else {
			ctx.setPanel(c.DEFAULT_PANEL)
		}
	}, [])

	const Panel = AppPanel[state.activePanel]

	if (!Panel) return null

	return (
		<Provider value={ctx}>
			{ctx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={ctx.spinner} />
				</HighlightedText>
			) : null}
			{mounted ? (
				<Panel /> // 	<RetrieveObjects
			) : // 		onEnd={() => {
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
			null}
			<Static items={ctx.text as string[]}>
				{(text, index) => <Text key={index}>{text}</Text>}
			</Static>
			<Spacer />
		</Provider>
	)
}

export default Application
