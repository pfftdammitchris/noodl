import React from 'react'
import { PanelConfig } from './types'
import * as c from './constants'

const initialPanel = {
	value: c.panel.INIT,
	label: 'Choose an option: ',
	type: 'select',
	items: [
		createPanel('Retrieve objects', c.panel.RETRIEVE_OBJECTS),
		createPanel('Retrieve keywords', c.panel.RETRIEVE_KEYWORDS),
	],
}

function usePanels() {
	const [panel, setPanel] = React.useState(initialPanel)
}

function getPanel(value: string): PanelConfig {
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

function createPanel(label: string, value: string, opts?: any) {
	return { label, value, ...opts }
}

export default getPanel
