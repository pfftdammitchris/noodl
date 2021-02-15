import { Mixin, wrap } from '../Mixin/mix'
import NoodlPage from '../NoodlPage'

type Constructor<T = {}> = new (...args: any[]) => T

function MixinDecorator(...constructors) {
	return function <T, U extends T>(baseClass: T): U {
		// `Mixin` is assumed to come from one of the solutions above.
		return (class Mixed extends Mixin(
			baseClass,
			...constructors,
		) {} as unknown) as U
	}
}

// const PageResolverMixin = Mixin(
// 	(Superclass): Constructor<any> => {
// 		return class extends Superclass {
// 			sayHello() {
// 				console.log('HELLO???')
// 			}
// 		}
// 	},
// )

const PageResolverMixin = MixinDecorator()

const decs = MixinDecorator(NoodlPage)

export default PageResolverMixin
