import * as T from 'noodl-types'

export const createPage = <C extends T.PageObject = any>(
	name: string,
	obj?: Partial<C>,
) => (pageProps?: Partial<C>): C => base(name, { ...obj, ...pageProps })

export function base<C extends T.PageObject = T.PageObject>(
	name: string,
	obj?: Partial<T.PageObject>,
): C {
	return {
		[name]: {
			...obj,
		},
	} as C
}
