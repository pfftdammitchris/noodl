import * as c from './constants'

export const retrievePanels = {
	value: 'retrieve-objects',
	label: 'Retrieve objects',
	type: 'select-multiple',
	options: [{ value: 'json' }, { value: 'yml' }],
}

export const retrieveKeywords = {
	value: 'retrieve-keywords',
	label: 'Retrieve keywords',
	type: 'input',
	placeholder: 'Enter a search keyword',
}

export const init = {
	value: 'init',
	type: 'select',
	label: 'Choose an option: ',
	options: [retrievePanels, retrieveKeywords],
}
