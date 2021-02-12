import { Project, ProjectOptions, ScriptTarget, ts } from 'ts-morph'
import yaml from 'yaml'
import { Alias, Collection, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import fs from 'fs-extra'
import path from 'path'

const project = new Project({
	compilerOptions: {
		module: ts.ModuleKind.CommonJS,
		target: ts.ScriptTarget.ESNext,
	},
})

project.getSourceFiles('dev/runServer.ts')

const src = `
  const two = 2;
  const four = 4;
`

function noodlTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
	return (context) => {
		const visit: ts.Visitor = (node) => {
			if (ts.isStringLiteral(node)) {
				console.log(node.getText())
			}
			return ts.visitEachChild(node, (child) => visit(child), context)
		}

		return (node) => ts.visitNode(node, visit)
	}
}
