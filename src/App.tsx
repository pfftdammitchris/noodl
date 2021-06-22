import * as u from '@jsmanifest/utils'
import { Box, Newline, Static, Text, useApp } from 'ink'
import merge from 'lodash/merge'
import React from 'react'
import produce, { Draft } from 'immer'
import BigText from 'ink-big-text'
import Gradient from 'ink-gradient'
import Aggregator from 'noodl-aggregator'
import Select from './components/Select'
import HighlightedText from './components/HighlightedText'
import Spinner from './components/Spinner'
import Settings from './panels/Settings'
import GenerateApp from './panels/GenerateApp'
import useConfiguration from './hooks/useConfiguration'
import Server from './panels/Server'
import store from './store'
import { Provider } from './useCtx'
import * as co from './utils/color'
import * as c from './constants'
import * as t from './types'

const aggregator = new Aggregator()

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

	React.useEffect(() => {
		// if (store.get('configKey')) {
		// 	aggregator.configKey = store.get('configKey')
		// }
		aggregator.on('ON_SET_CONFIG_KEY', (configKey) =>
			store.set('configKey', configKey),
		)
	}, [])

	return (
		<Provider value={ctx}>
			{state.activePanel === c.DEFAULT_PANEL && (
				<Gradient name="vice">
					<BigText text="noodl-cli" font="tiny" letterSpacing={1} />{' '}
					<Text color="white" bold>
						{cli.pkg.version}
					</Text>
					<Newline />
				</Gradient>
			)}
			{!state.ready ? (
				<Settings
					onReady={() => set({ ready: true, activePanel: state.activePanel })}
					pathToOutputDir={
						(cli.flags.outDir || cli.flags.generatePath) as string
					}
				/>
			) : state.activePanel === 'generateApp' ? (
				<GenerateApp
					config={cli.flags.config as string}
					configVersion={cli.flags.version}
					deviceType={cli.flags.device}
					env={cli.flags.env}
					host={cli.flags.host}
					isLocal={!cli.flags.remote}
					port={cli.flags.port}
					onEnd={() => cli.flags.server && ctx.setPanel('server')}
				/>
			) : state.activePanel === 'server' ? (
				<Server
					config={
						(u.isStr(cli.flags.server) &&
							cli.flags.server &&
							cli.flags.server) ||
						(cli.flags.config as string)
					}
					host={cli.flags.host}
					local={!cli.flags.remote}
					port={cli.flags.port}
					wss={cli.flags.wss}
					wssPort={cli.flags.wssPort}
					watch={cli.flags.watch}
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
							switch (item.value) {
								case 'generateApp':
									return ctx.setPanel('generateApp')
								case 'server':
									return ctx.setPanel('server')
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
