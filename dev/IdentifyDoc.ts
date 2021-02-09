import chalk from 'chalk'
import yaml from 'yaml'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import globby from 'globby'
import fs from 'fs-extra'
import path from 'path'

const IdentifyDoc = (function () {
	const o = {
		reference(node: Scalar) {
			if (typeof node.value !== 'string') return false
			if (node.value.startsWith('.')) return true
			if (node.value.startsWith('=')) return true
			if (node.value.startsWith('@')) return true
			if (node.value.endsWith('@')) return true
			return false
		},
	}

	return o
})()

export default IdentifyDoc
