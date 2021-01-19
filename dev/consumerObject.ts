import { ComponentObject } from 'noodl-types'
import curry from 'lodash/curry'
import produce, { createDraft, current } from 'immer'
import get from 'lodash/get'
import set from 'lodash/set'
import unset from 'lodash/unset'
import has from 'lodash/has'
import mergeWith from 'lodash/mergeWith'
import update from 'lodash/update'

/*
  Notes:
    - component having states (path emitting, etc)
*/

export interface ConsumerObject<
	O extends ComponentObject = ComponentObject,
	K extends keyof ComponentObject = keyof ComponentObject
> {
	prop: K
	cond?(...args: any[]): boolean
	async?: boolean
	type: 'morph' | 'replace' | 'remove' | 'rename'
	resolve(args: ConsumerResolveArgs): any
}

interface ConsumerResolveArgs {
	key?: string
	value?: any
	component: ComponentObject
	original: ComponentObject
}

const component = {
	type: 'view',
	style: { border: { style: '2' }, fontSize: '12', textColor: '0x33002299' },
	iteratorVar: 'myvar',
	children: [
		{ type: 'label', dataKey: 'itemObject.value' },
		{
			type: 'image',
			path: 'abc.png',
			onClick: [
				{ emit: { dataKey: { var1: 'itemObject' }, actions: [] } },
				{ actionType: 'builtIn', funcName: 'redraw', viewTag: 'genderTag' },
			],
		},
	],
}

function registerConsumer(consumer: ConsumerObject) {
	return consumer
}

const iteratorVarConsumer = registerConsumer({
	type: 'remove',
	prop: 'iteratorVar',
})

const borderStyleConsumer = registerConsumer({
	type: 'morph',
	prop: 'style.border',
	resolve({ value, component, original }) {
		if (component?.style?.border) delete component.style.border
		return {
			borderRadius: '0px',
			borderWidth: '1px',
			borderColor: '0x03320044',
		}
	},
})

const colorConsumer = registerConsumer({
	type: 'rename',
	prop: 'style.textColor',
	cond: ({ component }) => 'textColor' in (component.style || {}),
	resolve({ value, component }) {
		return 'style.color'
	},
})

const pathEmitConsumer = registerConsumer({
	type: 'replace',
	prop: 'path',
	async: true,
	async resolve({ value = '', component }) {
		return `https://go.com/${value}`
	},
})

const composeConsumers = (...objs) => (step) =>
	objs.reduceRight(
		(acc, obj) => step(acc, obj(acc)),
		(x) => x,
	)

export const createConsumerHOF = curry(
	<Options = any>(
		consumerOptions: Options,
		fn: any,
		step: any,
		component: ComponentObject,
	) => step(component, fn(component, consumerOptions)),
)

const step = (acc = () => {}, v) => acc(v)

const op = (function () {
	const o = {
		morph({ key, value, component }) {
			if (value && typeof value === 'object') {
				mergeWith(get(component, key), value, (obj, src, key) => {
					if (key === 'border') return value
				})
			}
			const deleted = unset(component, key)
			return this
		},
		remove({ key, component }) {
			const deleted = unset(component, key)
			return this
		},
		rename({ key, value: renamedKey, component }) {
			const currentValue = get(component, key, '')
			const deleted = unset(component, key)
			set(component, renamedKey, currentValue)
			return this
		},
		replace({ key, value, component }) {
			set(component, key, value || '')
			return this
		},
	}

	return o
})()

const consumers = [
	iteratorVarConsumer,
	borderStyleConsumer,
	colorConsumer,
	pathEmitConsumer,
]

const consume = curry((obj: ConsumerObject, component) => {
	if (obj.cond && !obj.cond({ component })) {
		return
	}

	const { type, prop, resolve } = obj

	if (type === 'remove') {
		op.remove({ key: prop, component })
	} else {
		if (obj.async) {
			resolve({ component }).then((value) => {
				op[type]?.({ key: prop, value, component })
			})
		} else {
			op[type]?.({ key: prop, value: resolve({ component }), component })
		}
	}
})

const draft = createDraft(component)

const composedConsumers = composeConsumers(
	...consumers.reduce(
		(acc, obj) => acc.concat(createConsumerHOF({})(consume(obj))),
		[],
	),
)

const transform = composedConsumers(step)

const resolveIt = (component) => {
	transform(component)
	if (Array.isArray(component.children)) {
		const numChildren = component.children.length
		for (let index = 0; index < numChildren; index++) {
			transform(component.children[index])
		}
	} else if (component.children) {
		transform(component.children)
	}
	return component
}

const result = resolveIt(draft)

setTimeout(() => {
	console.log(current(result))
}, 1000)
