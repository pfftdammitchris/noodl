import * as u from '@jsmanifest/utils'
import yaml from 'yaml'

export interface NoodlVisitFn<N extends yaml.Node = yaml.Node> {
	(args: {
		key: Parameters<yaml.visitorFn<N>>[0]
		node: Parameters<yaml.visitorFn<N>>[1]
		path: Parameters<yaml.visitorFn<N>>[2]
	}): ReturnType<yaml.visitorFn<N>>
}

export const visit = <N extends yaml.Node = any>(fn: NoodlVisitFn<N>) => {
	const visitNode: yaml.visitorFn<N> = (key, node, path) => {
		return fn({ key, node, path })
	}
	return visitNode
}

export const handleActionType = visit<yaml.Pair>(({ node }) => {
	//
})

const aggregateActions = function aggregateActions(doc: yaml.Document) {
	yaml.visit(doc, {
		Scalar(key, node, path) {
			//
		},
		Pair(key, node, path) {
			//
		},
		Map(key, node, path) {
			//
		},
		Seq(key, node, path) {
			//
		},
	})
}

export default aggregateActions
