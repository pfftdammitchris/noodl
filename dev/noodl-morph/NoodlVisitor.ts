import yaml from 'yaml'
import { Alias, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import NoodlScalar from './NoodlScalar'
import NoodlPair from './NoodlPair'
import NoodlMap from './NoodlMap'
import NoodlSeq from './NoodlSeq'

export interface Visitor {
	visit: {
		Alias?: yaml.visitor<Alias>
		Map?: yaml.visitor<NoodlMap>
		Pair?: yaml.visitor<NoodlPair>
		Scalar?: yaml.visitor<NoodlScalar>
		Seq?: yaml.visitor<NoodlSeq>
	}
}

function wrapScalarVisitor(
	scalarVisitor: yaml.visitor<Scalar>,
): yaml.visitor<Scalar> {
	return function (key, node, path) {
		return scalarVisitor?.(key, new NoodlScalar(node.value), path)
	}
}

function wrapPairVisitor(pairVisitor: yaml.visitor<Pair>): yaml.visitor<Pair> {
	return function (key, node, path) {
		return pairVisitor?.(key, new NoodlPair(node.value), path)
	}
}

function wrapYAMLMapVisitor(
	mapVisitor: yaml.visitor<YAMLMap>,
): yaml.visitor<YAMLMap> {
	return function (key, node, path) {
		const noodlMap = new NoodlMap(node)
		noodlMap.items = node.items
		return mapVisitor?.(key, noodlMap, path)
	}
}

function wrapYAMLSeqVisitor(
	seqVisitor: yaml.visitor<YAMLSeq>,
): yaml.visitor<YAMLSeq> {
	return function (key, node, path) {
		const noodlSeq = new NoodlSeq(node)
		noodlSeq.items = node.items
		return seqVisitor?.(key, noodlSeq, path)
	}
}

const NoodlVisitor = (function () {
	return {
		visit(doc: yaml.Document, visitor: Visitor) {
			return yaml.visit(doc, {
				Alias: undefined,
				Scalar: wrapScalarVisitor(visitor.visit.Scalar as yaml.visitor<Scalar>),
				Pair: wrapPairVisitor(visitor.visit.Pair as yaml.visitor<Pair>),
				Map: wrapYAMLMapVisitor(visitor.visit.Map as yaml.visitor<YAMLMap>),
				Seq: wrapYAMLSeqVisitor(visitor.visit.Seq as yaml.visitor<YAMLSeq>),
			})
		},
	}
})()

export default NoodlVisitor
