import * as T from 'noodl-types'

export const createComponent = <C extends T.ComponentObject = any>(
	type: string,
	opts?: Partial<C>,
) => (componentProps?: Partial<C>): C =>
	base(type, { ...opts, ...componentProps })

export function base<C extends T.ComponentObject = T.ComponentObject>(
	type: string,
	opts?: Partial<T.ComponentObject>,
): C {
	return { type, style: {}, ...opts } as C
}

export const button = createComponent<T.ButtonComponentObject>('button')

export const divider = createComponent<T.DividerComponentObject>('divider')

export const footer = createComponent<T.FooterComponentObject>('footer')

export const header = createComponent<T.HeaderComponentObject>('header')

export const image = createComponent<T.ImageComponentObject>('image', {
	path: '',
})

export const label = createComponent<T.LabelComponentObject>('label', {
	text: '',
})

export const list = createComponent<T.ListComponentObject>('list', {
	contentType: '',
	iteratorVar: '',
	listObject: [],
})

export const listItem = createComponent<T.ListItemComponentObject>('listItem')

export const plugin = createComponent<T.PluginComponentObject>('plugin', {
	path: '',
})

export const pluginHead = createComponent<T.PluginHeadComponentObject>(
	'pluginHead',
	{ path: '' },
)

export const pluginBodyTail = createComponent<T.PluginBodyTailComponentObject>(
	'pluginBodyTail',
	{ path: '' },
)

export const popUp = createComponent<T.PopUpComponentObject>('popUp', {
	popUpView: '',
})

export const register = createComponent<T.RegisterComponentObject>('register', {
	onEvent: '',
})

export const select = createComponent<T.SelectComponentObject>('select', {
	options: [],
})

export const scrollView = createComponent<T.ScrollViewComponentObject>(
	'scrollView',
)

export const textField = createComponent<T.TextFieldComponentObject>(
	'textField',
	{ placeholder: '' },
)

export const textView = createComponent<T.TextViewComponentObject>('textView')

export const video = createComponent<T.VideoComponentObject>('video', {
	path: '',
	videoFormat: '',
})

export const view = createComponent<T.ViewComponentObject>('view')
