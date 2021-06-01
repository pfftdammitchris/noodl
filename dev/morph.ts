process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import fs from 'fs-extra'
import path from 'path'
import { getAbsFilePath } from '../src/utils/common'
import metadata from './aggregator/metadata.json'
import createAggregator, {
	RETRIEVED_APP_BASE_URL,
	RETRIEVED_APP_CONFIG,
	RETRIEVED_APP_ENDPOINT,
	RETRIEVED_APP_PAGE,
	RETRIEVED_ROOT_BASE_URL,
	RETRIEVED_ROOT_CONFIG,
	RETRIEVED_VERSION,
	RETRIEVE_APP_PAGE_FAILED,
} from '../src/api/createAggregator'
import * as co from '../src/utils/color'

const paths = {
	metadata: getAbsFilePath('data/generated/metadata.json'),
	typings: getAbsFilePath('data/generated/typings.d.ts'),
	dummy: getAbsFilePath('data/generated/test.js'),
}

const aggregator = createAggregator('meet4d')
aggregator
	.init({
		loadPages: { includePreloadPages: true },
	})
	.then(() => {
		u.newline()
		u.log(co.green(`DONE`))
		u.newline()
	})
	.then(() => aggregator.loadAssets())
	.then(console.log)
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
