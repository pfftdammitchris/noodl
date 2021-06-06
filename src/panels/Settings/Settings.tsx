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
import useCtx from '../../useCtx'
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
	const { configuration } = useCtx()
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
