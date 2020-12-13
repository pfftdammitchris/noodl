import { traverse, types as t, template } from '@babel/core'
import path from 'path'
import fs from 'fs-extra'

export default function (babel) {
	return {
		name: 'babel-plugin-noodl',
		visitor: {
			FunctionDeclaration(path) {
				console.log(path)
			},
		},
	}
}
