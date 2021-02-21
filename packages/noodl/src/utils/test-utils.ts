import yaml from 'yaml'
import Noodl from '../Noodl'
import Visitor from '../Visitor'

export const globalPathToUserVertex = '.Global.currentUser.vertex'
export const pathToUserVertex = globalPathToUserVertex.split('.').slice(2) // currentUser.vertex

export const noodl = new Noodl()
export const visitor = new Visitor({ pages: noodl.pages, root: noodl.root })

export function createDocWithJsObject(obj: {
	[key: string]: any
}): yaml.Document.Parsed {
	return yaml.parseDocument(yaml.stringify(obj))
}
