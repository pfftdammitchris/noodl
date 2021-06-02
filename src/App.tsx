import { Box, Newline, Spacer, Static, Text, useApp } from 'ink'
import * as u from '@jsmanifest/utils'
import invariant from 'invariant'
import merge from 'lodash/merge'
import path from 'path'
import React from 'react'
import produce, { Draft } from 'immer'
import Divider from 'ink-divider'
import useStdoutDimensions from 'ink-use-stdout-dimensions'
import createAggregator from './api/createAggregator'
import Select from './components/Select'
import HighlightedText from './components/HighlightedText'
import Spinner from './components/Spinner'
import Settings from './panels/Settings'
import GenerateApp from './panels/GenerateApp'
import Server from './panels/Server'
import { Provider } from './useCtx'
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
	const [columns, rows] = useStdoutDimensions()

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
			{state.activePanel === c.DEFAULT_PANEL && (
				<Divider title="NOODL CLI" width={columns} dividerColor="magenta" />
			)}
			<Spacer />
			<Box flexDirection="column">
				{!state.ready ? (
					<Settings
						onReady={() => set({ ready: true, activePanel: state.activePanel })}
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
					<Server
						config={cli.flags.config as string}
						wss={cli.flags.wss}
						watch={cli.flags.watch}
					/>
				) : (
					<Box paddingLeft={1} flexDirection="column">
						<Text color="whiteBright">What would you like to do?</Text>
						<Newline />
						<Select
							items={[
								{
									value: 'generateApp',
									label: 'Generate an entire noodl app using a config',
								},
								{
									value: 'server',
									label: 'Start noodl development server',
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
			</Box>
		</Provider>
	)
}

export default Application
