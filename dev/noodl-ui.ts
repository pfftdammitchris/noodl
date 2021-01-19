import curry from 'lodash/curry'
import produce from 'immer'
import getBorders from './resolvers/getBorderAttrs'
import getColors from './resolvers/getColors'
import getElementType from './resolvers/getElementType'

const compose = (...fns) => {
	const apply = (arg, fn) => {
		fn(arg)
		return arg
	}
	return (x) => fns.reduceRight(apply, x)
}

const init = (composed) => (component) => (original) => {
	return produce(component, (draft) => {
		composed({ component: draft, original })
	})
}

const component = { style: {} }
const original = {
	type: 'view',
	style: {
		border: { style: '2' },
		textColor: '0x03300033',
		backgrouncColor: '0x33004455',
	},
}

const curried = init(compose(getBorders, getColors, getElementType))
const result = curried(component)(original)
console.log(result)
