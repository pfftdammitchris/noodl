import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

const { Lexer, Parser, Composer, CST } = yaml

const pathToYmlFile = path.resolve(path.join(process.cwd(), 'data/cst.yml'))
const yml = await fs.readFile(pathToYmlFile, 'utf8')
const token = CST.SCALAR
const lexer = new Lexer()
const parser = new Parser()
const composer = new Composer()

console.log(yml)
