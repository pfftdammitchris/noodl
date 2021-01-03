import * as T from 'noodl-types'

export function border(props?: Partial<T.StyleBorderObject>) {
	return {
		...props,
	}
}

export function textAlign(
	props: Partial<T.StyleTextAlignObject>,
): T.StyleTextAlignObject
export function textAlign(props: 'left' | 'center' | 'right'): typeof props
export function textAlign(props: Partial<T.StyleAlign>): T.StyleAlign
export function textAlign(props: T.StyleTextAlign) {
	if (typeof props === 'string') return props
	return { ...props }
}
