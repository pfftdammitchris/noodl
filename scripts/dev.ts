import createAggregator from './createAggregator'

const aggregator = createAggregator({ config: 'message' })

aggregator
	.init()
	.then(([rootConfig, appConfig]) => {
		console.log([rootConfig, appConfig])
	})
	.catch(console.error)
