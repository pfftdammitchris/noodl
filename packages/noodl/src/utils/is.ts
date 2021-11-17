import yaml from 'yaml'

	/** @param { yaml.YAMLMap } node */
  const isAction = (node) =>
  ['actionType', 'goto'].some((key) => node.has(key))

/** @param { yaml.YAMLMap } node */
const isComponent = (node) =>
  node.has('type') && ['children', 'style'].some((key) => node.has(key))

/** @param { yaml.Pair } node */
const isStyle = (node) =>
  yaml.isScalar(node.key) && node.key.value === 'style'