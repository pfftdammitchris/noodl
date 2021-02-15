import yaml from 'yaml'

export function createDocWithJsObject({ object }): yaml.Document {
	return yaml.parseDocument(yaml.stringify(object))
}
