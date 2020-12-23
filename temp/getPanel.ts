import React from 'react'
import chalk from 'chalk'
import { ListedItem } from 'ink-multi-select'
import createAggregator from '../src/api/createAggregator'
import * as c from '../src/constants'
import * as T from '../src/types'

class Panel {
	#placeholder: string = ''
	value: any
	label: string
	type: string

	constructor(value: any, label: string = '') {
		this.value = value
		this.label = label
	}

function usePanels({ aggregator }: { aggregator: ReturnType<typeof createAggregator>}) {
	const [panel, setPanel] = React.useState(initialPanel)



	const onSelectMultipleSubmit = React.useCallback((items: ListedItem[]) => {
		console.log(`Selecting multiple options: ${JSON.stringify(items, null, 2)}`)
	}, [])

	React.useEffect(() => {
		aggregator = createAggregator({
			config: 'message',
		})
	}, [])

return {
	panel,
	setPanel,
	onSelectMultipleSubmit,
}
}

function getPanel(value: string): T.PanelConfig {
	switch (value) {
		case c.panel.INIT:
			return {
				value: c.panel.INIT,
				label: 'Choose an option: ',
				type: 'select',
				items: [
					getPanel(c.panel.RETRIEVE_OBJECTS),
					getPanel(c.panel.RETRIEVE_KEYWORDS),
				],
			}
		case c.panel.RETRIEVE_OBJECTS:
			return {
				value: c.panel.RETRIEVE_OBJECTS,
				label: 'Retrieve objects',
				type: 'select-multiple',
				panel: {
					label: 'Select file extensions to keep:',
					options: ['json', 'yml'],
					selected: [],
				},
			}
		case c.panel.RETRIEVE_KEYWORDS:
			return {
				value: c.panel.RETRIEVE_KEYWORDS,
				label: 'Retrieve keywords',
				type: 'input',
				placeholder: 'Enter a search keyword',
			}
		default:
			throw new Error(`Invalid value for panel: ${value}`)
	}
}

const init = new SelectPanel(c.panel.INIT, 'Choose an option')
	.addOption({
		label: 'Retrieve objects in json',
		value: c.panel.RETRIEVE_OBJECTS,
	})
	.addOption({
		label: 'Retrieve objects in yml',
		value: c.panel.RETRIEVE_OBJECTS,
	})
	.addOption({
		label: 'Retrieve keywords',
		value: c.panel.RETRIEVE_KEYWORDS,
	})

function getPanel(name: string) {
	switch (name) {
		case 'init':
			return init
		default:
			return null
	}
}

export default getPanel
