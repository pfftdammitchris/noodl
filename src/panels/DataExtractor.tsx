import React from 'react'
import { Box } from 'ink'
import produce, { Draft } from 'immer'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import TextInput from 'ink-text-input'
import useCtx from '../useCtx'
import HighlightedText from '../components/HighlightedText'
import Spinner from '../components/Spinner'
import Select from '../components/Select'
import {
	getFilepath,
	magenta,
	yellow,
	saveJson,
	saveYml,
	withJsonExt,
	withYmlExt,
} from '../utils/common'
import * as c from '../constants'

export type DataExtractorProps = React.PropsWithChildren<{}>

const initialState = {
	//
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		default:
			return state
	}
}

function DataExtractor(props: DataExtractorProps) {
	return (
		<Box padding={1} flexDirection="column">
			<HighlightedText>Extract data</HighlightedText>
			<Box></Box>
		</Box>
	)
}

export default DataExtractor
