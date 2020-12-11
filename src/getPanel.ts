import { PanelConfig } from './types'
import * as c from './constants'

function getPanel(value: string): PanelConfig {
	switch (value) {
		case c.panel.INIT:
			return {
				value: c.panel.INIT,
				label: 'Choose an option: ',
				type: 'select',
				items: [
					getPanel(c.panel.RETRIEVED_OBJECTS),
					getPanel(c.panel.RETRIEVE_KEYWORDS),
				],
			}
		case c.panel.RETRIEVE_OBJECTS:
			return {
				value: c.panel.RETRIEVE_OBJECTS,
				label: 'Retrieve objects',
				type: 'select-multiple',
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

export default getPanel
