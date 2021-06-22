import * as babel from '@babel/core'
import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'
import * as esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'
// import { EcosAPIClient } from '@aitmed/protorepo/js/ecos/v1beta1/ecos_apiServiceClientPb'
// import { Edge, Vertex, Doc } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'
// import {
// 	cdReq,
// 	cdResp,
// 	ceReq,
// 	ceResp,
// 	cvReq,
// 	cvResp,
// 	dxReq,
// 	dxResp,
// 	rdResp,
// 	reResp,
// 	rvResp,
// 	rxReq,
// } from '../lib/ecos_api_pb'
// import { EcosAPIClient } from '../lib/ecos_apiServiceClientPb'
// import A from '../lib/ecos_api_pb'
// import B from '../lib/types_pb'
import * as t from './types'

const apiVersion = 'v1beta1'
const apiHost = 'albh2.aitmed.io'
const url = `https://${apiHost}`
// const ecos = new EcosAPIClient(apiHost, undefined) as t.Ecos

// let program = new ts.Project({
// 	compilerOptions: {
// 		allowJs: true,
// 		allowSyntheticDefaultImports: true,
// 		checkJs: true,
// 		charset: 'utf8',
// 		declaration: true,
// 		emitDeclarationOnly: true,
// 		esModuleInterop: true,
// 		lib: ['es2017', 'esnext'],
// 		module: ts.ModuleKind.ESNext,
// 		noEmitOnError: false,
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
// 	skipLoadingLibFiles: true,
// 	skipFileDependencyResolution: true,
// })

// const sourceFile = program.createSourceFile(
// 	path.join(__dirname, '../lib/index.d.ts'),
// 	fs.readFileSync(
// 		path.join(__dirname, '../lib/ecos_apiServiceClientPb.js'),
// 		'utf8',
// 	),
// 	{ overwrite: true },
// )

// sourceFile
// 	.emit({
// 		emitOnlyDtsFiles: true,
// 	})
// 	.then((result) => {
// 		sourceFile.saveSync()
// 	})

const pathsToCode = [
	path.join(
		__dirname,
		`../node_modules/@aitmed/protorepo/js/ecos/v1beta1/ecos_apiServiceClientPb.ts`,
	),
	path.join(
		__dirname,
		`../node_modules/@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb.js`,
	),
	path.join(
		__dirname,
		`../node_modules/@aitmed/protorepo/js/ecos/v1beta1/types_pb.js`,
	),
]

for (const pathToCode of pathsToCode) {
	const code = babel.transformSync(fs.readFileSync(pathToCode, 'utf8'), {
		filename: path.posix.basename(pathToCode),
		presets: ['@babel/preset-typescript'],
	})
	fs.writeFileSync(`${pathToCode}`, code.code, 'utf8')
}

// esbuild
// 	.build({
// 		bundle: true,
// 		charset: 'utf8',
// 		entryPoints: [
// 			'./node_modules/@aitmed/protorepo/js/ecos/v1beta1/ecos_apiServiceClientPb.ts',
// 			'./node_modules/@aitmed/protorepo/js/ecos/v1beta1/types_pb',
// 			'./node_modules/@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb',
// 		],

// 		format: 'cjs',
// 		outdir: 'lib',
// 		target: 'es2017',
// 		allowOverwrite: true,
// 		sourcemap: true,
// 	})
// 	.then((buildResult) => {
// 		console.log(`Build finished`)
// 	})
// 	.catch((err) => {
// 		console.error(err)
// 	})
