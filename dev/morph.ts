process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'path'
import { getAbsFilePath } from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import getActionsSourceFile from './actions'
import * as co from '../src/utils/color'

const paths = {
	assets: getAbsFilePath('data/generated/assets.json'),
	metadata: getAbsFilePath('data/generated/metadata.json'),
	typings: getAbsFilePath('data/generated/typings.d.ts'),
	actionTypes: getAbsFilePath('data/generated/actionTypes.d.ts'),
}

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

const sourceFile = program.createSourceFile(paths.typings)
const actions = getActionsSourceFile(program, paths.actionTypes)

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
	return src
}

const aggregator = createAggregator('meet4d')

aggregator
	.init({ loadPages: { includePreloadPages: true } })
	.then(() => {
		for (const [name, doc] of aggregator.root) {
			yaml.visit(doc, {
				Node(key, node, path) {},
				Scalar(key, node, path) {},
				Pair(key, node, path) {
					if (yaml.isScalar(node.key) && node.key.value === 'actionType') {
						if (yaml.isScalar(node.value) && u.isStr(node.value.value)) {
							actions.addAction(node.value.value, node.value)
						}
						return yaml.visit.SKIP
					}
				},
				Map(key, node, path) {
					if (node.has('actionType')) {
						const actionType = node.get('actionType') as string
						actions.addAction(actionType, node)
					}
				},
				Seq(key, node, path) {},
				Collection(key, node, path) {},
				Value(key, node, path) {},
			})
		}
	})
	.then(() => {
		// sourceFile.addInterface({
		// 	name: 'ActionTypes',
		// 	isExported: true,
		// 	properties: actionTypes.map((actionType) => ({
		// 		name: actionType,
		// 		type: 'string',
		// 	})),
		// })
	})
	.then(() => formatFile(actions.sourceFile).getText())
	.then(console.log)
	// .then(() => u.log('\n' + co.green(`DONE`) + '\n'))
	.catch((err) => {
		throw err
	})
