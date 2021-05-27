import * as u from '@jsmanifest/utils'
import invariant from 'invariant'
import React from 'react'
import produce, { Draft } from 'immer'
import { Spacer, Static, Text } from 'ink'
import { Provider } from './useCtx'
import createAggregator from './api/createAggregator'
import HighlightedText from './components/HighlightedText'
import GetServerFiles from './panels/GetServerFiles'
import SelectRoute from './panels/SelectRoute'
import Spinner from './components/Spinner'
import RetrieveObjects from './panels/RetrieveObjects'
// import RetrieveKeywords from './panels/RetrieveKeywords'
import RunServer from './panels/RunServer'
import useSettings from './hooks/useCliConfig'
import { findByRegexMap, getCliConfig } from './utils/common'
import * as c from './constants'
import * as t from './types'

const aggregator: ReturnType<typeof createAggregator> = createAggregator()
const injectKeysToIdsAndValues = <
	V extends Record<string, Partial<t.PanelObject>>,
>(
	obj: V,
) =>
	u.reduce(
		u.entries(obj),
		(acc, [key, panel]) =>
			u.assign(acc, { [key]: { ...panel, id: key, value: key } }),
		{} as Record<keyof V, t.PanelObject>,
	)

export const initialState = {
	caption: [] as string[],
	activePanel: '',
	highlightedPanel: '',
	panel: injectKeysToIdsAndValues({
		[c.app.panel.FETCH_OBJECTS]: {
			label: 'Retrieve NOODL objects',
		},
		[c.app.panel.FETCH_SERVER_FILES]: {
			label: 'Retrieve all files involved in the config',
		},
		[c.app.panel.RUN_SERVER]: {
			label: 'Run the server',
		},
		[c.app.panel.NOODL_WEBPACK_PLUGIN]: {
			label: 'Start the noodl webpack plugin',
		},
	}),
	queue: [] as string[],
	spinner: false as false | string,
}

function Application({ cli }: { cli: t.App.Context['cli'] }) {
	const [mounted, setMounted] = React.useState(false)
	const [state, _setState] = React.useState(initialState)
	const settings = useSettings({ server: { config: cli.flags.config } })

	const setState = React.useCallback(
		(fn: (draft: Draft<t.App.State>) => void) => void _setState(produce(fn)),
		[],
	)

	const ctx = {
		...state,
		aggregator,
		cli,
		settings,
		highlight: (id) => setState((d) => void (d.highlightedPanel = id)),
		log: (caption) => setState((d) => void d.caption.push(caption)),
		logError: (err) =>
			setState(
				(d) =>
					void d.caption.push(
						err instanceof Error
							? `[${u.red(err.name)}]: ${u.yellow(err.message)}`
							: err,
					),
			),
		toggleSpinner: (type) =>
			setState(
				// prettier-ignore
				(d) => void (d.spinner = u.isUnd(type) ? 'point' : type === false ? false : type),
			),
		setPanel: (id: t.App.PanelId) => setState((d) => void (d.activePanel = id)),
		updatePanel: (id, p) => setState((d) => void u.assign(d.panel[id], p)),
	} as t.App.Context

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const configObject = getCliConfig()
			if (cli.flags.retrieve?.length) {
				invariant(
					['json', 'yml'].some((ext) => cli.flags.retrieve?.includes(ext)),
					`Invalid value for "${u.magenta(`retrieve`)}" ` +
						`Valid options are: ${u.magenta('json')}, ${u.magenta('yml')}`,
				)
				setState((d) => void (d.activePanel = c.app.panel.FETCH_SERVER_FILES))
			} else if (cli.flags.server) {
				if (cli.flags.fetch) {
					setState((d) => void (d.activePanel = c.app.panel.FETCH_SERVER_FILES))
				} else {
					setState((d) => void (d.activePanel = c.app.panel.RUN_SERVER))
				}
			} else if (cli.flags.start) {
				const startScript = cli.flags.start
				if (['np', 'wplugin', 'webpack-plugin', 'wp'].includes(startScript)) {
					ctx.setPanel(c.app.panel.NOODL_WEBPACK_PLUGIN)
				}
			}
		} else {
			if (cli.flags.config || cli.flags.panel) {
				ctx.settings.set((draft) => {
					cli.flags.config && (draft.server.config = cli.flags.config)
					// cli.flags.panel && (draft.defaultPanel = cli.flags.panel)
				})
				if (cli.flags.server) {
					if (!cli.flags.panel) {
						// ctx.updatePanel({ value: c.panel.RETRIEVE_OBJECTS.value })
					} else {
						// ctx.updatePanel({ value: cli.flags.panel })
					}
				}
			}
		}
	}, [cli.flags])

	return (
		<Provider value={ctx}>
			{ctx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={ctx.spinner} />
				</HighlightedText>
			) : null}
			{mounted ? (
				state.activePanel === c.app.panel.FETCH_OBJECTS ? (
					<RetrieveObjects
						onEnd={() => {
							if (state.panel.runServer || cli.flags.server) {
								ctx.updatePanel(c.app.panel.RUN_SERVER, {
									idle: true,
									mounted: false,
								})
							}
						}}
					/>
				) : state.activePanel === c.app.panel.FETCH_SERVER_FILES ? (
					<GetServerFiles
						onDownloadedAssets={() =>
							cli.flags.server &&
							setState((d) => void (d.activePanel = c.app.panel.RUN_SERVER))
						}
					/>
				) : state.activePanel === c.app.panel.RUN_SERVER ? (
					<RunServer />
				) : (
					<SelectRoute />
				)
			) : null}
			<Static items={ctx.caption as string[]}>
				{(caption, index) => <Text key={index}>{caption}</Text>}
			</Static>
			<Spacer />
		</Provider>
	)
}

export default Application
