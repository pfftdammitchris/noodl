import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import yaml from 'yaml'
import fs from 'fs-extra'
import globby from 'globby'
import nock from 'nock'
import path from 'path'
import sinon from 'sinon'
import * as nc from '..'

const pathNameToFixtures = './src/__tests__/fixtures'
const pathnameToAboutAitmedPage = `${pathNameToFixtures}/AboutAitmed.yml`
const filenames = fs.readdirSync(pathNameToFixtures, 'utf8')

describe(nc.coolGold(`noodl-common`), () => {
	describe(nc.italic(`getFileMetadataObject`), () => {
		xit(``, () => {
			console.log(nc.getFileMetadataObject(pathnameToAboutAitmedPage))
		})
	})

	describe(nc.italic(`loadFile`), () => {
		it(`should return the raw file data as string by default when given only the filepath`, () => {
			const data = nc.loadFile(pathnameToAboutAitmedPage)
			expect(data).to.be.a.string
		})

		it(`should return the file data as a yaml doc when passing 'doc' as 2nd arg`, () => {
			expect(yaml.isDocument(nc.loadFile(pathnameToAboutAitmedPage, 'doc'))).to
				.be.true
		})

		it(`should return the file data as a JSON object when passing 'json' as 2nd arg`, () => {
			const data = nc.loadFile(pathnameToAboutAitmedPage, 'json')
			expect(u.isStr(data)).to.be.false
			expect(yaml.isDocument(data)).to.be.false
			expect(u.isObj(data)).to.be.true
			expect(data).to.have.property('AboutAitmed')
		})
	})

	describe(nc.italic(`loadFiles`), () => {
		describe.only(`when passing in filepath and 2nd arg type`, () => {
			it(`should return an array of yml data by default`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures)
				expect(ymls).to.have.lengthOf(filenames.length)
				ymls.forEach((yml) => expect(yml).to.be.a.string)
			})

			it(`should return an array of docs when 2nd arg is "doc"`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures, 'doc')
				expect(ymls).to.have.lengthOf(filenames.length)
				ymls.forEach((yml) => expect(yaml.isDocument(yml)).to.be.true)
			})

			it(`should return an array of objects when 2nd arg is "json"`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures, 'json')
				expect(ymls).to.have.lengthOf(filenames.length)
				ymls.forEach((yml) => expect(yml).to.be.an('object'))
			})

			// it(`should not include the ext in the keys by default`, () => {
			// 	const result = nc.loadFiles(pathnameToAboutAitmedPage)
			// 	filenames.forEach((filename) =>
			// 		expect(result).to.have.property(
			// 			path.posix.basename(filename, '.yml'),
			// 		),
			// 	)
			// })

			// it(`should load them into an object by default where each value is the yml`, () => {
			// 	const result = nc.loadFiles(pathnameToAboutAitmedPage)
			// 	const keys = u.keys(result)
			// 	expect(result).to.be.an('object')
			// 	expect(keys).to.have.lengthOf(filenames.length)
			// 	u.eachEntries(result, (filename, yml) => expect(yml).to.be.a.string)
			// })
		})

		describe(`when passing in the filepath as 1st arg and the return type as the 2nd`, () => {
			it(`should return an array of docs by default if 2nd arg is "doc"`, () => {
				const docs = nc.loadFiles(pathnameToAboutAitmedPage, 'doc')
				for (const doc of docs) {
					expect(yaml.isDocument(doc))
				}
				expect(docs).to.have.lengthOf(filenames.length)
			})

			xit(`should return an array of docs by default if 2nd arg is "json"`, () => {
				//
			})
		})

		describe(`when passing in the filepath and the return type option as an object`, () => {
			xit(``, () => {
				//
			})
		})
	})
})
