// @ts-nocheck
import generator from 'generator'
import fs from 'fs-extra'
import path from 'path'
import * as nc from 'noodl-common'

const outputPathname = 'generated'
;(async () => {
	const outputPath = nc.getAbsFilePath('data/generated/typings.d.ts')
	const docs = nc.loadFiles(outputPathname, {})

	generator.load(docs)

	const file = generator.createFile(outputPath)
	const actionTypings = file.actionTypings()
	const sourceFile = file.sourceFile

	console.log('', actionTypings.generate(docs))

	await sourceFile.save()
})()
