import * as u from '@jsmanifest/utils'
import pick from 'lodash/pick'
import { LiteralUnion } from 'type-fest'
import invariant from 'invariant'
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
import RetrieveObjects from './panels/RetrieveObjects'
import RunServer from './panels/RunServer'
import SelectRoute from './panels/SelectRoute'
import * as co from './utils/color'
import * as c from './constants'
import * as t from './types'

export const AppPanel = {
	getApp: GetApp,
	retrieveObjects: RetrieveObjects,
	runServer: RunServer,
	[c.DEFAULT_PANEL]: SelectRoute,
} as const

const aggregator: ReturnType<typeof createAggregator> = createAggregator()

export const initialState = {
	caption: [] as string[],
	activePanel: '' as LiteralUnion<keyof typeof AppPanel | '', string>,
	highlightedPanel: '',
	panels: {} as Record<t.App.PanelKey, t.PanelObject>,
	queue: [] as string[],
	spinner: false as false | string,
}

function Application({
	cli,
	cliConfig,
}: {
	cli: t.App.Context['cli']
	cliConfig: CliConfig
}) {
	const [mounted, setMounted] = React.useState(false)
	const [state, _setState] = React.useState<t.App.State>(() => {
		return {
			...initialState,
			panels: u.reduce(
				u.entries(cliConfig.state.panels),
				(acc, [panel, panelObject]) => u.assign(acc, { [panel]: panelObject }),
				{},
			),
		}
	})
	const { exit } = useApp()

	const set = React.useCallback(
		(fn: (draft: Draft<t.App.State>) => void) => void _setState(produce(fn)),
		[],
	)

	const ctx: t.App.Context = {
		...state,
		aggregator,
		cli,
		cliConfig,
		exit,
		set,
		highlight: (id) => set((d) => void (d.highlightedPanel = id)),
		log: (caption) => set((d) => void d.caption.push(caption)),
		logError: (err) =>
			set(
				(d) =>
					void d.caption.push(
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
		setPanel: (id: string) => {
			console.log('')
			ctx.log(
				`Panel is switching to ${u.cyan(id)}: ${u.white(
					cliConfig.state.panels[id]?.label,
				)}`,
			)
			console.log('')
			set((d) => void (d.activePanel = id))
		},
		update: (id, p) => set((d) => void u.assign(d.panels[id], p)),
	}

	React.useEffect(() => {
		setMounted(true)
	}, [])

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const handleGenerate = ({
				value,
			}: {
				value: t.App.Panel.Generate.Key
			}) => {
				if (AppPanel[value]) {
					ctx.setPanel(value)
				} else {
					u.log(
						co.red(
							`Invalid generate operation: "${co.white(value)}"\nSupported ` +
								`options are: ${co.yellow(u.keys(AppPanel).join(', '))}\n`,
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
					`Invalid value for "${u.magenta(`retrieve`)}" ` +
						`Valid options are: ${u.magenta('json')}, ${u.magenta('yml')}`,
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
				? handleGenerate({
						value: cli.flags.generate as t.App.PanelKey,
				  })
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
	}, [cli.flags])

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
			<Static items={ctx.caption as string[]}>
				{(caption, index) => <Text key={index}>{caption}</Text>}
			</Static>
			<Spacer />
		</Provider>
	)
}

export default Application
