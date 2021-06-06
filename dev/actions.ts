import yaml from 'yaml'
import * as ts from 'ts-morph'
import * as u from '@jsmanifest/utils'
import * as co from '../src/utils/color'

const getActionsSourceFile = function getActionsSourceFile(
	program: ts.Project,
	filepath: string,
) {
	const history = new Map<
		string,
		{
			actionType: string

			props: {
				key: string
				type: any
			}[]
			pages: string[]
			occurrences: number
			components: Record<string, { occurrences: number }>
		}
	>()

	const suffix = {
		ActionObject: 'ActionObject',
	}

	const sourceFile = program.createSourceFile(filepath)

	const uncommonPropsInterface = sourceFile.addInterface({
		name: 'UncommonActionObjectProps',
		isExported: true,
	})

	const baseObjectInterface = sourceFile.addInterface({
		name: 'ActionObject',
		isExported: true,
		typeParameters: [
			{
				kind: ts.StructureKind.TypeParameter,
				name: 'T',
				constraint: 'string',
				default: 'string',
			},
		],
		properties: [
			{
				name: 'actionType',
				type: 'string',
				kind: ts.StructureKind.PropertySignature,
			},
			{ name: `[key: string]`, type: 'any' },
		],
	})

	const o = {
		get sourceFile() {
			return sourceFile
		},
		getUncommonPropsInterface: () => uncommonPropsInterface,
		getBaseObjectInterface: () => baseObjectInterface,
		addAction(actionType: string, node: yaml.YAMLMap | yaml.Pair) {
			let name = actionType[0]
				.toUpperCase()
				.concat(actionType.substring(1) + 'ActionObject')

			let actionInterface = sourceFile.getInterface(name)
			let properties = [] as yaml.Pair[]

			if (!actionInterface) {
				actionInterface = sourceFile.addInterface({
					name,
				})
			}

			if (node.items && node.items.length > 1) {
				for (const pair of node.items) {
					if (yaml.isScalar(pair.key) && u.isStr(pair.key.value)) {
						if (pair.key.value !== 'actionType') {
							properties.push(pair)
							if (!actionInterface.getProperty(pair.key.value)) {
								actionInterface.addProperty({
									name: pair.key.value,
									type: 'string',
								})
							}
						}
					}
				}
			}

			return sourceFile.addInterface({
				name,
				extends: ['ActionObject'],
				isExported: true,
				typeParameters: [
					{
						kind: ts.StructureKind.TypeParameter,
						name: 'T',
						constraint: actionType,
					},
				],
				properties: [
					{
						name: 'actionType',
						type: 'string',
						kind: ts.StructureKind.PropertySignature,
					},
					{ name: `[key: string]`, type: 'any' },
				],
			})
		},
	}

	return o
}

export default getActionsSourceFile
