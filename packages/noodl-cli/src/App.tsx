import * as u from '@jsmanifest/utils'
import { Box, Newline, Static, Text, useApp } from 'ink'
import merge from 'lodash/merge.js'
import React from 'react'
import { produce, Draft } from 'immer'
import NoodlAggregator from 'noodl-aggregator'
import Select from './components/Select.js'
import HighlightedText from './components/HighlightedText.js'
import Spinner from './components/Spinner.js'
import Settings from './panels/Settings/Settings.js'
import GenerateApp from './panels/GenerateApp.js'
import useConfiguration from './hooks/useConfiguration.js'
import Server from './panels/Server.js'
import { Provider } from './useCtx.js'
import * as co from './utils/color.js'
import * as c from './constants.js'
import * as t from './types.js'

const aggregator = new NoodlAggregator()

export const initialState = {
	ready: false,
	activePanel: '' as t.App.PanelKey,
	highlightedPanel: '' as t.App.PanelKey,
	spinner: false as false | string,
	text: [] as string[],
}

function Application({ cli }: { cli: t.App.Context['cli'] }) {
	const [state, _setState] = React.useState<t.App.State>(initialState)
	const { exit } = useApp()
	const configuration = useConfiguration({ cli })

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
		cli,
		configuration,
		exit,
		set,
		highlight: (id) => set((d) => void (d.highlightedPanel = id)),
		log: (text) => set((d) => void d.text.push(text)),
		logError: (err) =>
			set((d) => {
				const error = err instanceof Error ? err : new Error(err)
				d.text.push(`[${u.red(error.name)}]: ${u.yellow(error.message)}`)
				d.text.push(u.red(error.stack))
			}),
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
	}

	React.useEffect(() => {
		if (u.keys(cli.flags).length) {
			const handleGenerate = () => {
				const generate = cli.flags.generate as string
				if (generate || u.isStr(generate)) {
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
				if (cli.flags.server === true) {
					ctx.setPanel('server')
				} else if (u.isStr(cli.flags.server)) {
					ctx.setPanel('server')
				}
			}

			if (cli.flags.generate) handleGenerate()
			else if (cli.flags.server) handleServer()
			else ctx.setPanel(c.DEFAULT_PANEL)
		} else {
			ctx.setPanel(c.DEFAULT_PANEL)
		}
	}, [])

	//

	return (
		<Provider value={ctx}>
			{state.activePanel === c.DEFAULT_PANEL && (
				<>
					<Text color="magenta">noodl-cli</Text>
					<Text color="white" bold>
						{cli.pkg.version}
					</Text>
					<Newline />
				</>
			)}
			{!state.ready ? (
				<Settings
					onReady={() => set({ ready: true, activePanel: state.activePanel })}
					pathToOutputDir={
						(cli.flags.outDir ||
							cli.flags.out ||
							cli.flags.generatePath) as string
					}
					tempDir={cli.flags.out}
				/>
			) : state.activePanel === 'generateApp' ? (
				<GenerateApp
					config={cli.flags.config as string}
					configVersion={cli.flags.version}
					isLocal={!cli.flags.remote}
					port={cli.flags.port}
					onEnd={() => cli.flags.server && ctx.setPanel('server')}
					isTemp={!!cli.flags.out}
				/>
			) : state.activePanel === 'server' ? (
				<Server
					config={
						(u.isStr(cli.flags.server) && cli.flags.server) ||
						(cli.flags.config as string)
					}
					isConfigFromServerFlag={
						u.isStr(cli.flags.server) && !!cli.flags.server
					}
					port={cli.flags.port}
					isRemote={!!cli.flags.remote}
					wss={cli.flags.wss ? { port: cli.flags.wssPort } : undefined}
					watch={cli.flags.wss}
				/>
			) : (
				<Box paddingLeft={1} flexDirection="column">
					<Text color="whiteBright">
						What would you like to do? (
						<Text dimColor>
							Use <Text color="yellow">--help</Text> to see all options
						</Text>
						)
					</Text>
					<Box minHeight={1} />
					<Select
						items={[
							{
								value: 'generateApp',
								label: 'Generate an entire noodl app using a config',
							},
							{
								value: 'server',
								label:
									'Start noodl development server (generate files first or provide them)',
							},
						]}
						onSelect={(item) => {
							// @ts-expect-error
							switch (item.value) {
								case 'generateApp':
									return ctx.setPanel('generateApp')
								case 'server':
									return ctx.setPanel('server')
								default:
									return ''
							}
						}}
					/>
					<Newline count={1} />
				</Box>
			)}
			<Static items={ctx.text as string[]}>
				{(text, index) => <Text key={index}>{text}</Text>}
			</Static>
			{ctx.spinner ? (
				<HighlightedText color="whiteBright">
					<Spinner type={ctx.spinner} />
				</HighlightedText>
			) : null}
		</Provider>
	)
}

export default Application
