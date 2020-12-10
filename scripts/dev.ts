import createAggregator from './createAggregator'

const aggregator = createAggregator({
	config: 'meet2d',
	env: 'test',
})

console.log(aggregator)
