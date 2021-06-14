/// <reference path="../packages/generator/dist/index.d.ts" />
import generator from 'generator'
import fs from 'fs-extra'
import path from 'path'
import { getAbsFilePath, loadFilesAsDocs } from 'noodl-common'

//
;(async () => {
	const outputPath = getAbsFilePath('data/generated/typings.d.ts')
	const docs = loadFilesAsDocs({
		as: 'doc',
		dir: 'generated/meet4d',
		recursive: true,
		includeExt: false,
	})

	generator.load(docs)

	const file = generator.createFile(outputPath)
	const actionTypings = file.actionTypings()
	const sourceFile = file.sourceFile

	console.log('', actionTypings.generate(docs))

	await sourceFile.save()
})()
