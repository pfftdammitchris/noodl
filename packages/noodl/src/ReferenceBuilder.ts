import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import Reference from './Reference'
import isRefNode from './utils/isRefNode'

class ReferenceBuilder {
	paths: Reference[] = []
	value = ''

	add(key: yaml.Scalar<any> | Reference | string) {
		const reference = isRefNode(key) ? key : new Reference(key)
		this.paths.push(reference)
		console.log(reference)
	}

	toString() {
		//
	}
}

export default ReferenceBuilder
