import yaml from 'yaml'
import upperFirst from 'lodash/upperFirst'
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

	const interfaces = {
		actionObject: new Map<string, ts.InterfaceDeclaration>(),
	}

	const createInterfaceName = (s: string) =>
		`${upperFirst(s)}${suffix.ActionObject}`
	const getInterfaceName = (s: string) => `${s}${suffix.ActionObject}`

	const _addActionObject = (node: yaml.YAMLMap) => {
		const actionType = node.get('actionType') as string
		sourceFile.addInterface({
			name: `${upperFirst(actionType)}${suffix.ActionObject}`,
			extends: ['ActionObject'],
			isExported: true,
			typeParameters: [{ name: 'T ', default: 'string', constraint: 'string' }],
		})
	}

	const o = {
		get sourceFile() {
			return sourceFile
		},
		getUncommonPropsInterface: () => uncommonPropsInterface,
		getBaseObjectInterface: () => baseObjectInterface,
		addAction(node: yaml.YAMLMap) {
			if (yaml.isMap(node)) {
				const actionType = node.get('actionType') as string
				let interf = sourceFile.getInterface(getInterfaceName(actionType))

				console.log(getInterfaceName(actionType))
				console.log(createInterfaceName(actionType))

				if (!interf) {
					interf = sourceFile.addInterface({
						name: createInterfaceName(actionType),
					})
				}

				if (!interf.hasExportKeyword()) {
					// interf.setIsExported(true)
				}

				if (
					!interf
						.getExtends()
						?.some?.((e) => e.getText().includes('ActionObject'))
				) {
					// interf.addExtends('ActionObject')
				}

				// if (!interf.getTypeParameter('T')) {
				// 	interf.addTypeParameter({
				// 		name: 'T',
				// 		default: 'string',
				// 		constraint: 'string',
				// 		kind: ts.StructureKind.TypeParameter,
				// 	})
				// }

				// if (!interf.getProperty('actionType')) {
				// 	const property = interf.addProperty({
				// 		name: 'actionType',
				// 		type: 'T',
				// 		kind: ts.StructureKind.PropertySignature,
				// 	})
				// }

				// if (!interf.getProperty('[key: string]')) {
				// 	interf.addProperty({
				// 		name: '[key: string]',
				// 		type: 'any',
				// 		kind: ts.StructureKind.PropertySignature,
				// 	})
				// }
			}
		},
	}

	return o
}

export default getActionsSourceFile
