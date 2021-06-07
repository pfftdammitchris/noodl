import * as u from '@jsmanifest/utils'
import React from 'react'
import Panel from '../../components/Panel'
import Init from './Init'
import PromptDir from './PromptDir'
import PromptInstantiateDir from './PromptInstantiateDir'
import { Provider as SettingsProvider } from './useSettingsCtx'
import useCtx from '../../useCtx'
import * as co from '../../utils/color'
import * as c from './constants'
import * as t from './types'

function Settings({
	onReady,
	pathToGenerateDir,
}: {
	onReady?(): void
	pathToGenerateDir?: string
}) {
	const [key, setKey] = React.useState('' as '' | t.PromptId)
	const [dir, setDir] = React.useState('')
	const { configuration, log } = useCtx()

	React.useEffect(() => {
		if (configuration.isFresh()) {
			ctx.setPrompt({ key: c.prompts.INIT })
		} else if (!configuration.getPathToGenerateDir()) {
			ctx.setPrompt({ key: c.prompts.ASK_GENERATE_PATH })
		} else {
			ctx.setPrompt({ key: '' })
			onReady?.()
		}

		if (pathToGenerateDir) {
			u.newline()
			const dirBefore = configuration.getPathToGenerateDir()
			configuration.setPathToGenerateDir(pathToGenerateDir)
			const dirAfter = configuration.getPathToGenerateDir()
			log(
				`Changed path to generated files from "${co.yellow(
					dirBefore,
				)}" to "${co.yellow(dirAfter)}"`,
			)
			u.newline()
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
