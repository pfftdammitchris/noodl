import yaml from 'yaml'
import upperFirst from 'lodash/upperFirst'
import * as ts from 'ts-morph'
import * as u from '@jsmanifest/utils'
import * as co from '../src/utils/color'

type MetadataObject = ReturnType<typeof createMetadataObject>

const createMetadataObject = () => {
	let value:
		| undefined
		| {
				array?: boolean
				boolean?: boolean
				function?: boolean
				number?: boolean
				null?: boolean
				object?: boolean
				reference?: boolean
				string?: boolean
				undefined?: boolean
		  }
	const o = {
		add(property: string, val: any) {
			if (!value) value = {}
			value[property] = val
		},
		has(key: string) {
			if (value?.[key]) return true
			return false
		},
		get value() {
			return value
		},
	}
	return o
}

const getCommponentsSourceFile = function getCommponentsSourceFile(
	program: ts.Project,
	filepath: string,
) {
	const metadata = {
		properties: new Map<string, MetadataObject>(),
	}

	const suffix = {
		ComponentObject: 'ComponentObject',
	}

	const sourceFile = program.createSourceFile(filepath)

	const uncommonPropsInterface = sourceFile.addInterface({
		name: 'uncommonComponentObjectProps',
		isExported: true,
	})

	const baseObjectInterface = sourceFile.addInterface({
		name: 'ComponentObject',
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
				name: 'type',
				type: 'T',
				kind: ts.StructureKind.PropertySignature,
			},
			{ name: `[key: string]`, type: 'any' },
		],
	})

	const referenceType = sourceFile.addTypeAlias({
		name: 'Reference',
		type: 'string',
		isExported: true,
	})

	const getInterfaceName = (s: string) =>
		`${upperFirst(s)}${suffix.ComponentObject}`

	function createIsExtending(value: string) {
		const isExtending = (interf: ts.InterfaceDeclaration) =>
			interf.getExtends().some((e) => e.getText().includes(value))
		return isExtending
	}

	const isExtendingActionObject = createIsExtending('ComponentObject')

	const o = {
		get metadata() {
			return metadata
		},
		get sourceFile() {
			return sourceFile
		},
		getUncommonPropsInterface: () => uncommonPropsInterface,
		getBaseObjectInterface: () => baseObjectInterface,
		addComponent(node: yaml.YAMLMap) {
			if (yaml.isMap(node)) {
				const type = node.get('type') as string
				let interf = sourceFile.getInterface(getInterfaceName(type))

				if (!interf) {
					interf = sourceFile.addInterface({
						name: getInterfaceName(type),
					})
				}

				!interf.hasExportKeyword() && interf.setIsExported(true)

				if (!isExtendingActionObject(interf)) {
					interf.addExtends(`ComponentObject`)
				}

				const members = interf.getMembers()

				if (
					!members.some(
						(type) => type.getText().replace(';', '') === '[key: string]: any',
					)
				) {
					interf
						.addMember({
							name: '[key: string]',
							type: 'any',
							kind: ts.StructureKind.PropertySignature,
						})
						.formatText({ semicolons: ts.ts.SemicolonPreference.Remove })
				}

				for (const pair of node.items) {
					if (yaml.isScalar(pair.key)) {
						const key = pair.key.value as string

						if (!interf.getProperty(key)) {
							if (yaml.isScalar(pair.value)) {
								const componentType =
									key === 'type'
										? `'${type}'`
										: key === 'object'
										? referenceType.getName()
										: 'string'

								interf.addMember({
									name: key,
									hasQuestionToken: key !== 'type',
									isReadonly: false,
									kind: ts.StructureKind.PropertySignature,
									type: componentType,
								})
							}
						}

						if (yaml.isMap(pair.value)) {
						}

						if (!metadata.properties.has(key)) {
							metadata.properties.set(key, createMetadataObject())
						}

						const metadataObject = metadata.properties.get(key)

						if (yaml.isMap(pair.value) && !metadataObject.has('object')) {
							metadataObject.add('object', true)
						} else if (yaml.isSeq(pair.value) && !metadataObject.has('array')) {
							metadataObject.add('array', true)
						} else if (yaml.isScalar(pair.value)) {
							const type = typeof pair.value.value
							if (type === 'boolean' && !metadataObject.has('boolean')) {
								metadataObject.add('boolean', true)
							} else if (type === 'number' && !metadataObject.has('number')) {
								metadataObject.add('number', true)
							} else if (type === 'string' && !metadataObject.has('string')) {
								metadataObject.add('string', true)
							} else if (
								type === 'undefined' &&
								!metadataObject.has('undefined')
							) {
								metadataObject.add('undefined', true)
							}
						}
					}
				}

				return yaml.visit.SKIP
			}
		},
	}

	return o
}

export default getCommponentsSourceFile
