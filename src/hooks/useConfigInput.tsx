import React from 'react'
import produce, { Draft } from 'immer'
import { configExists } from '../utils/remote'

export interface Options {
	initialConfig?: string
	onValidateStart?(configKey): void
	onValidateEnd?(configKey): void
	onExists?(configKey: string): void
	onNotFound?(configKey: string): void
	onError?(error: Error, configKey: string): void
}

const initialState = {
	config: '',
	valid: false,
	validating: false,
	lastTried: '',
}

function useConfigInput({
	initialConfig: configProp,
	onValidateStart,
	onValidateEnd,
	onExists,
	onError,
	onNotFound,
}: Options) {
	const [inputValue, setInputValue] = React.useState('')
	const [state, _setState] = React.useState(initialState)

	const setState = React.useCallback(
		(fn: (draft: Draft<typeof initialState>) => void) => {
			_setState(produce(fn))
		},
		[],
	)

	const validate = React.useCallback(async (configKey: string) => {
		if (configKey) {
			onValidateStart?.(configKey)
			setState((draft) => {
				draft.validating = true
				draft.lastTried = configKey
			})
			setInputValue('')
			const exists = await configExists(configKey)
			if (exists === true) {
				setState((draft) => {
					draft.config = configKey
					draft.valid = true
					draft.validating = false
				})
				onExists?.(configKey)
			} else if (exists === false) {
				onNotFound?.(configKey)
				setState((draft) => void (draft.validating = false))
			} else if (exists instanceof Error) {
				onError?.(exists, configKey)
				setInputValue(configKey)
				setState((draft) => void (draft.validating = false))
			}
			onValidateEnd?.(configKey)
		}
	}, [])

	React.useEffect(() => {
		configProp && validate(configProp)
	}, [])

	return {
		...state,
		validate,
		inputValue,
		setInputValue,
	}
}

export default useConfigInput
