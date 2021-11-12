/** @param { yaml.YAMLMap } node */
export function isAction(node) {
	return ['actionType', 'goto'].some((key) => node.has(key))
}

/** @param { yaml.YAMLMap } node */
export function isComponent(node) {
	return node.has('type') && ['children', 'style'].some((key) => node.has(key))
}

/** @param { yaml.Pair } node */
export function isStyle(node) {
	return yaml.isScalar(node.key) && node.key.value === 'style'
}
