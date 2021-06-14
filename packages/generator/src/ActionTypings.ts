import * as ts from 'ts-morph'
import yaml from 'yaml'
import upperFirst from 'lodash/upperFirst'
import { createIsExtending } from './utils'
import Typings from './Typings'
import * as util from './utils'
import * as t from './types'

const suffix = {
	actionObject: 'ActionObject',
}

class ActionTypings extends Typings {
	isExtendingBaseObject = createIsExtending(suffix.actionObject)

	constructor(sourceFile: ts.SourceFile) {
		super(sourceFile)

		const anyActionObject = sourceFile.addTypeAlias({
			name: 'AnyActionObject',
			isExported: true,
			type: '""',
		})

		const baseActionObjectInterface = sourceFile.addInterface({
			name: `ActionObject`,
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
					type: 'T',
					kind: ts.StructureKind.PropertySignature,
				},
				{ name: `[key: string]`, type: 'any' },
			],
		})

		const uncommonPropsInterface = sourceFile.addInterface({
			name: `Uncommon${suffix.actionObject}Props`,
			isExported: true,
		})

		this.typeAliases.set(anyActionObject.getName(), anyActionObject)

		this.interfaces.set(
			baseActionObjectInterface.getName(),
			baseActionObjectInterface,
		)

		this.interfaces.set(
			uncommonPropsInterface.getName(),
			uncommonPropsInterface,
		)
	}

	get propertiesInterface() {
		return this.sourceFile.getInterface(
			`Uncommon${suffix.actionObject}Props`,
		) as ts.InterfaceDeclaration
	}

	addAction(node: yaml.YAMLMap) {
		if (yaml.isMap(node)) {
			const actionType = node.get('actionType') as string
			const interfaceName = `${upperFirst(actionType || '')}${
				suffix.actionObject
			}`
			const interf =
				this.sourceFile.getInterface(interfaceName) ||
				this.sourceFile.addInterface({ name: interfaceName })

			!interf.hasExportKeyword() && interf.setIsExported(true)
			!util.isArbitrary(interf) && util.setArbitrary(interf)
			!this.isExtendingBaseObject(interf) && interf.addExtends(`ActionObject`)

			for (const pair of node.items) {
				if (yaml.isScalar(pair.key)) {
					const key = pair.key.value as string

					const options = {
						name: key,
						hasQuestionToken: key !== 'actionType',
						isReadonly: false,
						kind: ts.StructureKind.PropertySignature,
						type:
							key === 'actionType'
								? `'${actionType}'`
								: key === 'object'
								? `Record<string, any>`
								: 'string',
					} as ts.TypeElementMemberStructures

					!interf.getProperty(key) && interf.addMember(options)

					this.metadata.properties.set(
						key,
						this.metadata.properties.has(key)
							? this.getMetadata(this.metadata.properties.get(key), pair.value)
							: this.getMetadata(pair.value),
					)

					if (
						key !== 'actionType' &&
						!this.propertiesInterface.getProperty(key)
					) {
						this.propertiesInterface.addMember(options)
					}
				}
			}

			util.setPropertyPosition(
				(val) => val.getText().replace(';', '') === '[key: string]: any',
				interf.getMembers(),
				'last',
			)

			return yaml.visit.SKIP
		}
	}

	generate(docs: yaml.Document[]) {
		for (const doc of docs) {
			yaml.visit(doc, {
				Map: (key, node, path) => {
					if (node.has('actionType')) {
						return this.addAction(node)
					}
				},
			})
		}
		return this.toString({
			formatOptions: {
				onAfterSort({ sortedInterfaces, sortedTypeAliases }) {
					const anyActionObjectTypeAlias = sortedTypeAliases.find(
						(typeDec) => typeDec.getName() === 'AnyActionObject',
					)
					if (anyActionObjectTypeAlias) {
						const actionObjectInterface = sortedInterfaces.find(
							(interf) => interf.getName() === 'ActionObject',
						)

						if (actionObjectInterface) {
							// Places 'AnyActionObject' right after 'ActionObject
							const actionObjInterfIndex = actionObjectInterface.getChildIndex()
							const anyActionObjTypeAliasIndex = actionObjInterfIndex + 1
							anyActionObjectTypeAlias.setOrder(anyActionObjTypeAliasIndex)
						} else {
							anyActionObjectTypeAlias.setOrder(0)
						}
					}
				},
			},
		})
	}

	getActionTypes() {}
}

export default ActionTypings
