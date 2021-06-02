process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
// import * as ts from 'ts-morph'
import fs from 'fs-extra'
// import path from 'path'
import { getAbsFilePath } from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'
import * as co from '../src/utils/color'

const paths = {
	assets: getAbsFilePath('data/generated/assets.json'),
	metadata: getAbsFilePath('data/generated/metadata.json'),
	typings: getAbsFilePath('data/generated/typings.d.ts'),
}

const aggregator = createAggregator('meet4d')
aggregator
	.init({ loadPages: { includePreloadPages: true } })
	.then(aggregator.extractAssets)
	.then((assets) => fs.writeJson(paths.assets, assets, { spaces: 2 }))
	.then(() => u.log('\n' + co.green(`DONE`) + '\n'))
	.catch((err) => {
		throw err
	})

// const program = new ts.Project({
// 	compilerOptions: {
// 		allowJs: true,
// 		allowSyntheticDefaultImports: true,
// 		charset: 'utf8',
// 		declaration: true,
// 		emitDeclarationOnly: true,
// 		baseUrl: __dirname,
// 		module: ts.ModuleKind.ESNext,
// 		noEmitOnError: false,
// 		resolveJsonModule: true,
// 		skipLibCheck: true,
// 		sourceMap: true,
// 		target: ts.ScriptTarget.ESNext,
// 	},
// 	manipulationSettings: {
// 		indentationText: ts.IndentationText.TwoSpaces,
// 		insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
// 		quoteKind: ts.QuoteKind.Single,
// 		newLineKind: ts.NewLineKind.LineFeed,
// 		useTrailingCommas: true,
// 	},
// 	skipAddingFilesFromTsConfig: true,
// 	skipLoadingLibFiles: true,
// 	skipFileDependencyResolution: true,
// 	// useInMemoryFileSystem: true,
// })

// const sourceFile = program.addSourceFileAtPathIfExists(paths.metadata)
// sourceFile.removeText()

// sourceFile.formatText({
// 	baseIndentSize: 2,
// 	convertTabsToSpaces: true,
// 	ensureNewLineAtEndOfFile: true,
// 	indentMultiLineObjectLiteralBeginningOnBlankLine: true,
// 	indentSize: 2,
// 	insertSpaceAfterCommaDelimiter: true,
// 	insertSpaceAfterConstructor: true,
// 	insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
// 	insertSpaceAfterKeywordsInControlFlowStatements: true,
// 	insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
// 	insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: true,
// 	insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
// 	insertSpaceAfterTypeAssertion: true,
// 	insertSpaceBeforeFunctionParenthesis: false,
// 	insertSpaceBeforeTypeAnnotation: true,
// 	semicolons: ts.ts.SemicolonPreference.Remove,
// 	tabSize: 2,
// 	trimTrailingWhitespace: true,
// })

// const interfaceDeclaration = sourceFile.addInterface({
// 	name: 'Hello',
// 	isExported: true,
// 	properties: metadata.actionTypes.map((actionType) => ({
// 		name: actionType,
// 		type: 'string',
// 	})),
// 	docs: ['hello'],
// })
