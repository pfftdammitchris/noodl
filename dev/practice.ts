import ts from 'typescript'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'

// const src = `
// function getGreeting() {
//   return 'hello!'
// }
// `

const src = `
  const two = 2;
  const four = 4;
`

let result = ts.transpileModule(src, {
	compilerOptions: {
		module: ts.ModuleKind.CommonJS,
	},
	transformers: {
		before: [noodlTransformer()],
	},
})

function noodlTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
	return (context) => {
		const visit: ts.Visitor = (node) => {
			if (ts.isNumericLiteral(node)) return ts.createStringLiteral(node.text)
			return ts.visitEachChild(node, (child) => visit(child), context)
		}

		const s: ts.VisitResult<ts.Node>

		return (node) => ts.visitNode(node, visit)
	}
}

console.log(result.outputText)
