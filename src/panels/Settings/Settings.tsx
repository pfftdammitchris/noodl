import * as u from '@jsmanifest/utils'
import React from 'react'
import merge from 'lodash/merge'
import { PartialDeep } from 'type-fest'
import produce, { Draft } from 'immer'
import Panel from '../../components/Panel'
import Init from './Init'
import PromptDir from './PromptDir'
import PromptInstantiateDir from './PromptInstantiateDir'
import { Provider as SettingsProvider } from './useSettingsCtx'
import { DEFAULT_GENERATE_DIR } from '../../constants'
import useCtx from '../../useCtx'
import * as co from '../../utils/color'
import * as c from './constants'
import * as t from './types'

export const initialState = {
	prompt: {} as {
		key: null | '' | t.PromptId
		dir?: string
	},
	options: {},
}

function Settings({ onReady }: { onReady?(): void }) {
	const { cli, configuration, log } = useCtx()
	const [state, _setState] = React.useState(initialState)

	const setState = React.useCallback(
		(
			fn:
				| ((draft: Draft<t.SettingsState>) => void)
				| Partial<PartialDeep<t.SettingsState>>,
		) => {
			_setState(
				produce((draft) => {
					if (u.isFnc(fn)) fn(draft)
					else if (u.isObj(fn)) merge(draft, fn)
				}),
			)
		},
		[],
	)

	React.useEffect(() => {
		// console.log(`${co.cyan(`Global settings`)}: `, configuration.getAll())
	}, [])

	React.useEffect(() => {
		if (configuration.isFresh()) {
			ctx.setPrompt({ key: c.prompts.INIT })
		} else if (!configuration.getPathToGenerateDir()) {
			ctx.setPrompt({ key: c.prompts.ASK_GENERATE_PATH })
		} else {
			ctx.setPrompt({ key: '' })
			onReady?.()
		}

		if (cli.flags.generatePath) {
			u.newline()
			if (cli.flags.generatePath !== DEFAULT_GENERATE_DIR) {
				const dirBefore = configuration.getPathToGenerateDir()

				if (dirBefore.endsWith(cli.flags.generatePath)) {
					log(
						`The path to generated files was already set to "${co.yellow(
							dirBefore,
						)}"`,
					)
				} else {
					configuration.setPathToGenerateDir(cli.flags.generatePath)
					const dirAfter = configuration.getPathToGenerateDir()
					log(
						`Changed path to generated files from "${co.yellow(
							dirBefore,
						)}" to "${co.yellow(dirAfter)}"`,
					)
				}
			}
			u.newline()
		}
	}, [])

	const ctx: t.SettingsContext = {
		...state,
		setPrompt: React.useCallback((prompt) => setState({ prompt }), []),
	}

	return (
		<SettingsProvider value={ctx}>
			<Panel newline={false}>
				{state.prompt?.key ? (
					state.prompt.key === c.prompts.INIT ? (
						<Init onReady={onReady} />
					) : state.prompt.key === c.prompts.ASK_GENERATE_PATH ? (
						<PromptDir onReady={onReady} />
					) : state.prompt.key === c.prompts.ASK_INSTANTIATE_GENERATE_PATH ? (
						<PromptInstantiateDir onReady={onReady} />
					) : null
				) : null}
			</Panel>
		</SettingsProvider>
	)
}

export default Settings
