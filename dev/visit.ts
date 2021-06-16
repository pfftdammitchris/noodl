import yaml from 'yaml'
import * as t from './types'

const visit = <N extends yaml.Node = any>(
	{ name, doc, data },
	fn: t.NoodlVisitFn<N>,
) => {
	const visitNode: yaml.visitorFn<N> = (key, node, path) => {
		return fn({ name, doc, data, key, node, path })
	}
	return visitNode
}

export default visit
