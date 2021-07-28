// @ts-nocheck
import { Noodl, Root, Page, Visitor, Identify } from 'noodl'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import globby from 'globby'

const ymlFiles = globby
	.sync(path.resolve(path.join(__dirname, './fixtures'), `**/*.yml`), {
		objectMode: true,
		onlyFiles: true,
	})
	.map((file: any) => ({
		name: file.name,
		yml: fs.readFileSync(file.path, 'utf8'),
	})) as { name: string; yml: string }[]

const noodl = new Noodl()
const visitor = new Visitor({ pages: noodl.pages, root: noodl.root })

ymlFiles.forEach(({ name, yml }) => {
	name = name.substring(0, name.indexOf('.'))
	noodl.createPage({
		name,
		doc: yaml.parseDocument(yml),
		spread: /(BaseCSS|BaseDataModel)/.test(name),
	})
})

let index = 0

console.log(!!visitor.pages.get('EditProfile'))

visitor.visit(noodl.pages.get('EditProfile'), (args, util) => {
	console.log(++index)
})
