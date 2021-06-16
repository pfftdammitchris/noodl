import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import flowRight from 'lodash/flowRight'
import yaml from 'yaml'
import { data as stats } from '../morph'
import visit from '../visit'
import * as t from '../types'

class Reference {
	node: yaml.Scalar<string>

	constructor(node: yaml.Scalar) {
		this.node = node as yaml.Scalar<string>
		this.node.source
	}
}

const getReference: t.NoodlVisitFn<yaml.Scalar> = ({
	name,
	data,
	doc,
	node,
	path,
}) => {
	if (u.isStr(node.value)) {
		const { value } = node
		if (Identify.reference(value)) {
			const reference = new Reference(node)

			if (!(value in data.references)) {
				data.references[value] = { page: name }
			}
		}
	}
}

const aggregateReferences = (function () {
	function _aggregateReferences({
		name = '',
		doc,
		data,
	}: {
		name: string
		doc: yaml.Document
		data: typeof stats
	}) {
		yaml.visit(doc, {
			Scalar: visit({ name, doc, data }, flowRight(getReference)),
			Pair: visit({ name, doc, data }, flowRight()),
			Map: visit({ name, doc, data }, flowRight()),
			Seq: visit({ name, doc, data }, flowRight()),
		})
	}

	return _aggregateReferences
})()

export default aggregateReferences
