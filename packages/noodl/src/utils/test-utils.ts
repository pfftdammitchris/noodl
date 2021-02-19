import yaml from 'yaml'

export function createDocWithJsObject(obj: {
	[key: string]: any
}): yaml.Document.Parsed {
	return yaml.parseDocument(yaml.stringify(obj))
}
