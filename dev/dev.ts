import path from 'path'
import fs from 'fs-extra'
import { transform } from '@babel/core'
import { parse } from '@babel/parser'

const code = `function f() {}`

const parsed = transform(code, {
	plugins: ['./babel/output/babel-plugin-noodl'],
})
