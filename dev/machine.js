const xs = require('xstate')

const increment = (ctx) => ctx.count + 1
const decrement = (ctx) => ctx.count - 1

const counterMachine = xs.createMachine({
	initial: 'active',
	context: {
		count: 0,
	},
	states: {
		active: {
			on: {
				INC: {
					actions: xs.assign({ count: increment }),
					cond: (ctx) => ctx.count < 10,
				},
				DEC: {
					actions: xs.assign({ count: decrement }),
					cond: (ctx) => ctx.count > 0,
				},
			},
		},
	},
})

const counterService = xs.interpret(counterMachine)

counterService.onTransition((state) => console.log(state.context.count)).start()

counterService.send('INC')
counterService.send('INC')
counterService.send('INC')
counterService.send('INC')
counterService.send('DEC')
counterService.send('DEC')
counterService.send('DEC')
counterService.send('DEC')
counterService.send('DEC')
counterService.send('DEC')
counterService.send('DEC')
