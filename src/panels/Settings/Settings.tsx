import React from 'react'
import Panel from '../../components/Panel.js'
import Init from './Init.js'
import OutputDir from './OutputDir.js'
import PromptDir from './PromptDir.js'
import PromptInstantiateDir from './PromptInstantiateDir.js'
import { Provider as SettingsProvider } from './useSettingsCtx.js'
import useCtx from '../../useCtx.js'
import { DEFAULT_OUTPUT_DIR } from '../../constants.js'
import * as c from './constants.js'
import * as t from './types.js'

function Settings({
	onReady,
	pathToOutputDir,
}: {
	onReady?(): void
	pathToOutputDir?: string
}) {
	const [key, setKey] = React.useState('' as '' | t.PromptId)
	const [dir, setDir] = React.useState('')
	const { configuration, log } = useCtx()

	React.useEffect(() => {
		if (configuration.isFresh()) {
			ctx.setPrompt({ key: c.prompts.INIT })
		} else if (pathToOutputDir) {
			ctx.setPrompt({ key: c.prompts.SET_OUTPUT_DIR })
		} else if (!configuration.getPathToGenerateDir()) {
			ctx.setPrompt({ key: c.prompts.ASK_GENERATE_PATH })
		} else {
			ctx.setPrompt({ key: '' })
			onReady?.()
		}
	}, [])

	const ctx: t.SettingsContext = {
		key,
		dir,
		setPrompt: React.useCallback((prompt) => {
			prompt?.key && setKey(prompt.key)
			prompt?.dir && setDir(prompt.dir)
		}, []),
	}

	return (
		<SettingsProvider value={ctx}>
			<Panel newline={false}>
				{key ? (
					key === c.prompts.INIT ? (
						<Init onReady={onReady} />
					) : key === c.prompts.SET_OUTPUT_DIR ? (
						<OutputDir
							value={pathToOutputDir || DEFAULT_OUTPUT_DIR}
							onConfirm={onReady}
						/>
					) : key === c.prompts.ASK_GENERATE_PATH ? (
						<PromptDir onReady={onReady} />
					) : key === c.prompts.ASK_INSTANTIATE_GENERATE_PATH ? (
						<PromptInstantiateDir onReady={onReady} />
					) : null
				) : null}
			</Panel>
		</SettingsProvider>
	)
}

export default Settings
