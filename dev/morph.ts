import fs from 'fs-extra'
import path from 'path'
import * as ts from 'ts-morph'

const metadataFilePath = path.join(
	process.cwd(),
	'data/generated/metadata.json',
)
const serverFilePath = path.join(__dirname, 'server.ts')
const scriptFilePath = path.join(__dirname, 'script.ts')
const typingsFileDir = path.join(__dirname, 'typings')

const program = new ts.Project({
	compilerOptions: {
		allowJs: true,
		allowSyntheticDefaultImports: true,
		charset: 'utf8',
		declaration: true,
		emitDeclarationOnly: true,
		baseUrl: __dirname,
		inlineSourceMap: true,
		module: ts.ModuleKind.CommonJS,
		noEmitOnError: true,
		resolveJsonModule: true,
		skipLibCheck: true,
		target: ts.ScriptTarget.ES5,
	},
})

const directory = program.createDirectory('./typings')
const sourceFile = directory.addSourceFileAtPath(metadataFilePath)
sourceFile.transform((traversal) => {
	traversal.currentNode.console.log(
		traversal.currentNode.getText() + '\n------',
	)
	return traversal.visitChildren()
})
// directory.
// const directory = program.createDirectory(path.join(__dirname, 'typings'))
// const sourceFile = directory.getSourceFile('./typings/index.d.ts')
// console.log(sourceFile.compilerNode)
// const sourceFiles = directory.getSourceFiles()

// console.log(directory.getSourceFiles())

// const sourceFile = program.addSourceFileAtPath(metadataFilePath)

// sourceFile.addImportDeclaration({
// 	moduleSpecifier: 'hello',
// 	kind: ts.StructureKind.ImportDeclaration,
// 	namedImports: ['abc', 'onetwo', 'three'],
// })

// const emitResult = program.emitToMemory({
// 	emitOnlyDtsFiles: true,
// })

// emitResult.getDiagnostics().forEach((diagnostic) => {
// 	const info = {
// 		category: diagnostic.getCategory(),
// 		code: diagnostic.getCode(),
// 		line: diagnostic.getLineNumber(),
// 		length: diagnostic.getLength(),
// 		start: diagnostic.getStart(),
// 	}

// 	console.log(info)
// })
