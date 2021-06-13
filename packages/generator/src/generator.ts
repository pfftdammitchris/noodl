import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import yaml from 'yaml'
import ActionTypings from './ActionTypings'
import * as util from './utils'

const generator = (function () {
	let docs = [] as yaml.Document[]

	let program = new ts.Project({
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

	const source = function createSource(sourceFile: ts.SourceFile) {
		const _o = {
			sourceFile,
			actionTypings() {
				return new ActionTypings(sourceFile)
			},
			componentTypings() {},
		}
		return _o
	}

	const o = {
		load(_docs: yaml.Document[]) {
			docs = docs
			return o
		},
		createFile(filepath: string) {
			return source(
				program.createSourceFile(filepath, undefined, {
					overwrite: true,
				}),
			)
		},
	}

	return o
})()

export default generator
