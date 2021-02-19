import yaml from 'yaml'
import NoodlVisitor from '../NoodlVisitor'

export const visitor = new NoodlVisitor()

export function createDocWithJsObject(obj: {
	[key: string]: any
}): yaml.Document.Parsed {
	return yaml.parseDocument(yaml.stringify(obj))
}
