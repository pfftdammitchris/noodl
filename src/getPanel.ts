import startCase from 'lodash/startCase'
import * as c from './constants'

class Panel {
	#placeholder: string = ''
	value: any
	label: string
	type: string

	constructor(value: any, label: string = '') {
		this.value = value
		this.label = label
	}

	placeholder(placeholder: string) {
		this.#placeholder = placeholder
	}

	toJS() {
		return {
			value: this.value,
			label: startCase(this.label),
			placeholder: this.#placeholder,
		}
	}
}

class SelectPanel extends Panel {
	type = 'select'
	options: { label: string; value: any }[] = []
	constructor(...args) {
		super(...args)
	}
	addOption(option: string | SelectPanel['options'][number]) {
		if (typeof option === 'string') {
			this.options.push(this.createOption(option))
		} else {
			this.options.push(option)
		}
		return this
	}
	createOption(option: string) {
		return { label: option, value: option }
	}
	toJS() {
		return { ...super.toJS(), items: this.options }
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
