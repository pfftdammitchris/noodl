import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import { expect } from 'chai'
import * as nc from 'noodl-common'
import fs from 'fs-extra'
import path from 'path'
import Reference from '../Reference'

const createReference = (ref: string) => new Reference(ref)

const getPageDoc = (name = 'ReferenceTest') =>
	nc.loadFile(path.join(__dirname, `./fixtures/${name}.yml`), 'doc')

describe(nc.italic(`Reference`), () => {
	it(``, () => {
		const reference = createReference()
		console.log()
	})
})
