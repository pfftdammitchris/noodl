process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as com from 'noodl-common'
import generator from 'generator'
import prettier from 'prettier'
import yaml from 'yaml'
import fs from 'fs-extra'
import Aggregator from '../src/api/Aggregator'
// import getActionsSourceFile from './actions'
import getComponentsSourceFile from './Generator/components'
import pkg from '../package.json'
import * as co from '../src/utils/color'

const paths = {
	docs: com.getAbsFilePath('generated'),
	assets: com.getAbsFilePath('data/generated/assets.json'),
	metadata: com.getAbsFilePath('data/generated/metadata.json'),
	typings: com.getAbsFilePath('data/generated/typings.d.ts'),
	actionTypes: com.getAbsFilePath('data/generated/actionTypes.d.ts'),
	componentTypes: com.getAbsFilePath('data/generated/componentTypes.d.ts'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = com.normalizePath(filepath)
}

fs.existsSync(paths.actionTypes) && fs.removeSync(paths.actionTypes)
fs.existsSync(paths.componentTypes) && fs.removeSync(paths.componentTypes)

const program = new ts.Project({
	compilerOptions: {
		allowJs: true,
		allowSyntheticDefaultImports: true,
		charset: 'utf8',
		declaration: true,
		emitDeclarationOnly: true,
		baseUrl: __dirname,
		module: ts.ModuleKind.ESNext,
		noEmitOnError: false,
		resolveJsonModule: true,
		skipLibCheck: true,
		sourceMap: true,
		target: ts.ScriptTarget.ESNext,
	},
	manipulationSettings: {
		indentationText: ts.IndentationText.TwoSpaces,
		insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
		quoteKind: ts.QuoteKind.Single,
		newLineKind: ts.NewLineKind.LineFeed,
		useTrailingCommas: true,
	},
	skipAddingFilesFromTsConfig: true,
	skipLoadingLibFiles: true,
	skipFileDependencyResolution: true,
	// useInMemoryFileSystem: true,
})

const sourceFile = program.createSourceFile(paths.typings, undefined, {
	overwrite: true,
})

// const actions = getActionsSourceFile(program, paths.actionTypes)
const components = getComponentsSourceFile(program, paths.componentTypes)

// const actionInterface = sourceFile.addInterface({
// 	name: actionType[0]
// 		.toUpperCase()
// 		.concat(actionType.substring(1))
// 		.concat(`ActionObject`),
// 	extends: [
// 		(writer) =>
// 			writer
// 				.write(`ActionObject,`)
// 				.write(`Pick<UncommonActionObjectProps, 'object'>`),
// 	],
// 	properties: [
// 		{
// 			name: 'actionType',
// 			type: actionType,
// 		},
// 	],
// 	isExported: true,
// })

function formatFile(src: ts.SourceFile) {
	src.formatText({
		baseIndentSize: 2,
		convertTabsToSpaces: true,
		ensureNewLineAtEndOfFile: true,
		indentMultiLineObjectLiteralBeginningOnBlankLine: true,
		indentSize: 2,
		insertSpaceAfterCommaDelimiter: true,
		insertSpaceAfterConstructor: true,
		insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
		insertSpaceAfterKeywordsInControlFlowStatements: true,
		insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
		insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: true,
		insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
		insertSpaceAfterTypeAssertion: true,
		insertSpaceBeforeFunctionParenthesis: false,
		insertSpaceBeforeTypeAnnotation: true,
		semicolons: ts.ts.SemicolonPreference.Remove,
		tabSize: 2,
		trimTrailingWhitespace: true,
	})
	const srcCode = prettier.format(src.getText(), {
		...pkg.prettier,
		parser: 'typescript',
	} as prettier.Options)
	return srcCode
}

const aggregator = new Aggregator('meet4d')
const docFiles = com.loadFilesAsDocs({
	as: 'metadataDocs',
	dir: paths.docs,
	recursive: true,
})

for (const { name, doc } of docFiles) {
	aggregator.root.set(name, doc)
}

Promise.resolve()
	.then(() => {
		for (const [name, doc] of aggregator.root) {
			yaml.visit(doc, {
				Node(key, node, path) {},
				Scalar(key, node, path) {},
				Pair(key, node, path) {
					// if (yaml.isScalar(node.key) && node.key.value === 'actionType') {
					// 	if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
					// 		actions.addAction(node.value.value, node.value as any)
					// 	}
					// 	return yaml.visit.SKIP
					// }
				},
				Map(key, node, path) {
					if (node.has('actionType')) {
						// return actions.addAction(node)
					}

					if (node.has('type') && (node.has('children') || node.has('style'))) {
						return components.addComponent(node)
					}
				},
				Seq(key, node, path) {},
				Collection(key, node, path) {},
				Value(key, node, path) {},
			})
		}
	})
	.then(() => {
		// Action typings
		// for (const interf of actions.sourceFile.getInterfaces()) {
		// 	const members = interf.getMembers()
		// 	for (const member of members) {
		// 		if (member.getText().replace(';', '') === `[key: string]: any`) {
		// 			member.setOrder(members.length - 1)
		// 		}
		// 	}

		// 	for (const property of interf.getProperties()) {
		// 		const name = property.getName()
		// 		const typeValues = []
		// 		if (name !== 'actionType') {
		// 			if (actions.metadata.properties.has(name)) {
		// 				const metadata = actions.metadata.properties.get(name)
		// 				if (u.isObj(metadata.value)) {
		// 					const propertyNode = property.getTypeNode()
		// 					const propertyValue = propertyNode.getText()

		// 					for (const [key, val] of u.entries(metadata.value)) {
		// 						if (val) {
		// 							if (!propertyValue.includes(key)) {
		// 								typeValues.push(key)
		// 							}
		// 						}
		// 					}
		// 				}
		// 			}
		// 			if (typeValues.length) {
		// 				property.remove()
		// 				interf.insertProperty(interf.getMembers().length - 1, {
		// 					name,
		// 					type: typeValues.reduce((acc, val) => {
		// 						if (val == 'array') acc += `| any[]`
		// 						else if (val == 'function') acc += `| ((...args: any[]) => any)`
		// 						else if (val == 'object') acc += `| Record<string, any>`
		// 						else acc += `| ${val}`
		// 						return acc
		// 					}, ''),
		// 				})
		// 			}
		// 		}
		// 	}
		// }

		// Component typings
		for (const interf of components.sourceFile.getInterfaces()) {
			const members = interf.getMembers()
			for (const member of members) {
				if (member.getText().replace(';', '') === `[key: string]: any`) {
					member.setOrder(members.length - 1)
				}
			}

			for (const property of interf.getProperties()) {
				const name = property.getName()
				const typeValues = []
				if (name !== 'type') {
					if (name.includes('text=func')) {
						console.log(name)
						console.log(name)
						console.log(name)
					}
					if (components.metadata.properties.has(name)) {
						const metadata = components.metadata.properties.get(name)
						if (u.isObj(metadata.value)) {
							const propertyNode = property.getTypeNode()
							const propertyValue = propertyNode.getText()

							for (const [key, val] of u.entries(metadata.value)) {
								if (val) {
									if (!propertyValue.includes(key)) {
										typeValues.push(key)
									}
								}
							}
						}
					}
					if (typeValues.length) {
						property.remove()
						interf.insertProperty(interf.getMembers().length - 1, {
							name,
							type: typeValues.reduce((acc, val) => {
								if (val == 'array') acc += `| any[]`
								else if (val == 'function') acc += `| ((...args: any[]) => any)`
								else if (val == 'object') acc += `| Record<string, any>`
								else acc += `| ${val}`
								return acc
							}, ''),
						})
					}
				}
			}
		}
	})
	.then(() => ({
		// actionsSourceCode: formatFile(actions.sourceFile),
		componentsSourceCode: formatFile(components.sourceFile),
	}))
	.then(({ actionsSourceCode, componentsSourceCode }) => {
		let srcCode = ''

		// srcCode += `${actionsSourceCode}\n\n`
		srcCode += `${componentsSourceCode}\n\n`

		fs.writeFile(sourceFile.getFilePath(), srcCode, 'utf8')
	})
	.then(() => u.log('\n' + co.green(`DONE`) + '\n'))
	.catch((err) => {
		throw err
	})
