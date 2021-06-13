import * as ts from 'ts-morph'
import prettier from 'prettier'
import yaml from 'yaml'
import {
	createMetadataObject,
	sortAlphabetically,
	sortInterfaceProperties,
} from './utils'
import * as t from './types'

class Typings {
	hooks = new Map()
	interfaces: Map<string, ts.InterfaceDeclaration>
	metadata = {
		properties: new Map<string, t.MetadataObject>(),
	}
	sourceFile: ts.SourceFile

	constructor(sourceFile: ts.SourceFile) {
		this.sourceFile = sourceFile
		this.interfaces = new Map()
	}

	formatFile() {
		const sortedInterfaces = sortAlphabetically(
			(node) => node.getName(),
			this.sourceFile.getInterfaces(),
		)

		const numInterfaces = sortedInterfaces.length

		for (let index = 0; index < numInterfaces; index++) {
			const interf = sortedInterfaces[index]
			interf.setOrder(index)
			sortInterfaceProperties(interf)
		}

		this.sourceFile.formatText({
			baseIndentSize: 2,
			convertTabsToSpaces: true,
			ensureNewLineAtEndOfFile: true,
			indentMultiLineObjectLiteralBeginningOnBlankLine: true,
			indentSize: 2,
			insertSpaceAfterCommaDelimiter: true,
			insertSpaceAfterConstructor: true,
			insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
			insertSpaceAfterKeywordsInControlFlowStatements: true,
			insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: true,
			insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: true,
			insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
			insertSpaceAfterTypeAssertion: true,
			insertSpaceBeforeFunctionParenthesis: false,
			insertSpaceBeforeTypeAnnotation: false,
			semicolons: ts.ts.SemicolonPreference.Remove,
			tabSize: 2,
			trimTrailingWhitespace: true,
		})
	}

	getMetadata(
		metadataObject: t.MetadataObject | undefined,
		value: unknown,
	): t.MetadataObject
	getMetadata(value: unknown): t.MetadataObject
	getMetadata(metadataObject: t.MetadataObject | unknown, value?: unknown) {
		let metadata: t.MetadataObject | undefined

		if (value === undefined) {
			value = metadataObject
			metadata = createMetadataObject()
		} else {
			metadata = metadataObject as t.MetadataObject
		}

		if (yaml.isMap(value) && !metadata.has('object')) {
			metadata.add('object', true)
		} else if (yaml.isSeq(value) && !metadata.has('array')) {
			metadata.add('array', true)
		} else if (yaml.isScalar(value)) {
			const type = typeof value.value
			if (type === 'boolean' && !metadata.has('boolean')) {
				metadata.add('boolean', true)
			} else if (type === 'number' && !metadata.has('number')) {
				metadata.add('number', true)
			} else if (type === 'string' && !metadata.has('string')) {
				metadata.add('string', true)
			} else if (type === 'undefined' && !metadata.has('undefined')) {
				metadata.add('undefined', true)
			}
		}
		return metadata
	}

	toString() {
		this.formatFile()
		return prettier.format(this.sourceFile.getText(), {
			arrowParens: 'always',
			endOfLine: 'lf',
			printWidth: 80,
			semi: false,
			singleQuote: true,
			tabWidth: 2,
			trailingComma: 'all',
			parser: 'typescript',
		} as prettier.Options)
	}
}

export default Typings
