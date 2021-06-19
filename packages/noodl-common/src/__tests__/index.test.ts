import * as u from '@jsmanifest/utils'
import { expect } from 'chai'
import path from 'path'
import yaml from 'yaml'
import fs from 'fs-extra'
import minimatch, { Minimatch } from 'minimatch'
import * as nc from '..'

const pathNameToFixtures = './src/__tests__/fixtures'
const pathnameToAboutAitmedPage = `${pathNameToFixtures}/AboutAitmed.yml`
const filenames = fs.readdirSync(pathNameToFixtures, 'utf8')

describe(nc.coolGold(`noodl-common`), () => {
	describe(nc.italic(`getFileStructure`), () => {
		const docExts = ['json', 'pdf', 'doc', 'docx'] as const
		docExts.forEach((docExt) => {
			const documentStructPath = `/Users/christ/noodl-cli/SignIn.${docExt}`
			it(`should return the expected document file structure for "${documentStructPath}"`, () => {
				const fileStructure = nc.getFileStructure(documentStructPath)
				expect(fileStructure).to.have.property('dir', `/Users/christ/noodl-cli`)
				expect(fileStructure).to.have.property('ext', `.${docExt}`)
				expect(fileStructure).to.have.property('filename', `SignIn`)
				expect(fileStructure).to.have.property('filepath', documentStructPath)
				expect(fileStructure).to.have.property('rootDir', `/`)
				expect(fileStructure).to.have.property('group', 'document')
			})
		})

		const configStructPath = '/christ/noodl-cli/meet4d.yml'
		it(`should return the expected config file structure for "${configStructPath}"`, () => {
			const fileStructure = nc.getFileStructure(configStructPath, {
				config: 'meet4d',
			})
			expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`)
			expect(fileStructure).to.have.property('ext', `.yml`)
			expect(fileStructure).to.have.property('filename', 'meet4d')
			expect(fileStructure).to.have.property('filepath', configStructPath)
			expect(fileStructure).to.have.property('rootDir', `/`)
			expect(fileStructure).to.have.property('group', `config`)
		})

		const imageStructPath = '/christ/noodl-cli/pop.jpeg'
		it(`should return the expected image file structure for "${imageStructPath}"`, () => {
			const fileStructure = nc.getFileStructure(imageStructPath, {
				config: 'meet4d',
			})
			expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`)
			expect(fileStructure).to.have.property('ext', `.jpeg`)
			expect(fileStructure).to.have.property('filename', 'pop')
			expect(fileStructure).to.have.property('filepath', imageStructPath)
			expect(fileStructure).to.have.property('rootDir', `/`)
			expect(fileStructure).to.have.property('group', `image`)
		})

		const pageStructPath = '/christ/noodl-cli/CreateNewAccount.yml'
		it(`should return the expected page file structure for "${pageStructPath}"`, () => {
			const fileStructure = nc.getFileStructure(pageStructPath, {
				config: 'meet4d',
			})
			expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`)
			expect(fileStructure).to.have.property('ext', `.yml`)
			expect(fileStructure).to.have.property('filename', 'CreateNewAccount')
			expect(fileStructure).to.have.property('filepath', pageStructPath)
			expect(fileStructure).to.have.property('rootDir', `/`)
			expect(fileStructure).to.have.property('group', `page`)
		})

		const videoStructPath = '/christ/noodl-cli/hi.mp4'
		it(`should return the expected video file structure for "${imageStructPath}"`, () => {
			const fileStructure = nc.getFileStructure(videoStructPath)
			expect(fileStructure).to.have.property('dir', `/christ/noodl-cli`)
			expect(fileStructure).to.have.property('ext', `.mp4`)
			expect(fileStructure).to.have.property('filename', 'hi')
			expect(fileStructure).to.have.property('filepath', videoStructPath)
			expect(fileStructure).to.have.property('rootDir', `/`)
			expect(fileStructure).to.have.property('group', `video`)
		})
	})

	describe(nc.italic(`getLinkStructure`), () => {
		const docExts = ['json', 'pdf', 'doc', 'docx'] as const
		docExts.forEach((docExt) => {
			const documentStructPath = `https://aitmed.io/config/index.${docExt}`
			it(`should return the expected document file structure for "${documentStructPath}"`, () => {
				const linkStructure = nc.getLinkStructure(documentStructPath)
				expect(linkStructure).to.have.property('ext', `.${docExt}`)
				expect(linkStructure).to.have.property('filename', `index`)
				expect(linkStructure).to.have.property('isRemote', true)
				expect(linkStructure).to.have.property('group', 'document')
				expect(linkStructure).to.have.property('url', documentStructPath)
			})
		})

		const configStructurePath = `https://aitmed.io/config/index/abc.yml`
		it(`should return the expected config file structure for "${configStructurePath}"`, () => {
			const linkStructure = nc.getLinkStructure(configStructurePath, {
				config: 'abc',
			})
			expect(linkStructure).to.have.property('ext', `.yml`)
			expect(linkStructure).to.have.property('filename', `abc`)
			expect(linkStructure).to.have.property('isRemote', true)
			expect(linkStructure).to.have.property('group', 'config')
			expect(linkStructure).to.have.property('url', configStructurePath)
		})

		const imageStructurePath = `https://aitmed.io/config/index/abc.png`
		it(`should return the expected config file structure for "${imageStructurePath}"`, () => {
			const linkStructure = nc.getLinkStructure(imageStructurePath)
			expect(linkStructure).to.have.property('ext', `.png`)
			expect(linkStructure).to.have.property('filename', `abc`)
			expect(linkStructure).to.have.property('isRemote', true)
			expect(linkStructure).to.have.property('group', 'image')
			expect(linkStructure).to.have.property('url', imageStructurePath)
		})

		const pageStructurePath = `https://aitmed.io/config/index/Abc.yml`
		it(`should return the expected config file structure for "${pageStructurePath}"`, () => {
			const linkStructure = nc.getLinkStructure(pageStructurePath, {
				config: 'ab',
			})
			expect(linkStructure).to.have.property('ext', `.yml`)
			expect(linkStructure).to.have.property('filename', `Abc`)
			expect(linkStructure).to.have.property('isRemote', true)
			expect(linkStructure).to.have.property('group', 'page')
			expect(linkStructure).to.have.property('url', pageStructurePath)
		})

		const videoStructurePath = `https://aitmed.io/config/index/loop.mp4`
		it(`should return the expected config file structure for "${videoStructurePath}"`, () => {
			const linkStructure = nc.getLinkStructure(videoStructurePath, {
				config: 'ab',
			})
			expect(linkStructure).to.have.property('ext', `.mp4`)
			expect(linkStructure).to.have.property('filename', `loop`)
			expect(linkStructure).to.have.property('isRemote', true)
			expect(linkStructure).to.have.property('group', 'video')
			expect(linkStructure).to.have.property('url', videoStructurePath)
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

	it.only('hello', () => {
		const dir = path.join(__dirname, 'fixtures')
		console.log(dir)
		console.log(nc.readdirSync(dir))
	})

	describe(nc.italic(`loadFiles`), () => {
		describe(`when passing in filepath and 2nd arg type`, () => {
			it(`should return an array of yml data by default`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures)
				expect(ymls).to.have.lengthOf(filenames.length)
				// @ts-expect-error
				ymls.forEach((yml) => expect(yml).to.be.a.string)
			})

			it(`should return an array of docs when 2nd arg is "doc"`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures, 'doc')
				expect(ymls).to.have.lengthOf(filenames.length)
				ymls.forEach((yml) => expect(yaml.isDocument(yml)).to.be.true)
			})

			it(`should return an array of objects when 2nd arg is "json"`, () => {
				const ymls = nc.loadFiles(pathNameToFixtures, 'json')
				expect(ymls).to.be.an('array')
			})

			it(`should load them into an array if as is "list"`, () => {
				const result = nc.loadFiles(pathNameToFixtures, { as: 'list' })
				expect(result).to.be.an('array').with.lengthOf(filenames.length)
				u.eachEntries(result, (filename, yml) => expect(yml).to.be.a.string)
			})

			it(`should load them into a map if as is "map"`, () => {
				const result = nc.loadFiles(pathNameToFixtures, { as: 'map' })
				expect(result).to.be.instanceOf(Map)
				expect(result.size).to.eq(filenames.length)
			})

			it(`should load them into an object if as is "object"`, () => {
				const result = nc.loadFiles(pathNameToFixtures, { as: 'object' })
				const keys = u.keys(result)
				expect(result).to.be.an('object')
				expect(keys).to.have.lengthOf(filenames.length)
				u.eachEntries(result, (filename, yml) => expect(yml).to.be.a.string)
			})

			it(`should not include the ext as their keys by default for object keys`, () => {
				const result = nc.loadFiles(pathNameToFixtures, { as: 'object' })
				filenames.forEach((filename) =>
					expect(result).to.have.property(path.basename(filename, '.yml')),
				)
			})

			it(`should not include the ext by default for map keys`, () => {
				const result = nc.loadFiles(pathNameToFixtures, { as: 'map' })
				expect(result.size).to.eq(filenames.length)
				filenames.forEach(
					(filename) =>
						expect(result.has(path.basename(filename, '.yml'))).to.be.true,
				)
			})

			it(`should include the ext in the keys if includeExt is true`, () => {
				const result = nc.loadFiles(pathNameToFixtures, {
					as: 'object',
					includeExt: true,
				})
				filenames.forEach((filename) => {
					expect(result).to.have.property(filename)
					expect(filename.endsWith('.yml')).to.be.true
				})
			})

			it(`should include the ext in the keys if includeExt is true for map output`, () => {
				const result = nc.loadFiles(pathNameToFixtures, {
					as: 'map',
					includeExt: true,
				})
				filenames.forEach((filename) => {
					expect(result.has(filename)).to.be.true
					expect(filename.endsWith('.yml')).to.be.true
				})
			})
		})
	})
})
