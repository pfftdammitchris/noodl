import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

const toAbsPath = (...str) => path.resolve(path.join(process.cwd(), ...str))

const configYml = fs.readFileSync(toAbsPath('./data/meetd2/meetd2.yml'), 'utf8')
const configDoc = yaml.parseDocument(configYml)

const lexer = new yaml.Lexer()
const tokens = lexer.lex(configYml)

fs.writeJsonSync(toAbsPath('data/meetd2tokens.json'), Array.from(tokens), {
	spaces: 2,
})

const tokenCode = {
	'\u0002': 'START_OF_TEXT',
	'\u001f': 'UNIT_SEPARATOR',
	'\r': 'NEWLINE',
	'\r\n': 'NEWLINE',
}
