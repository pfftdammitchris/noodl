import * as u from '@jsmanifest/utils'
import * as ts from 'ts-morph'

export function createIsExtending(value: string) {
	function isExtending(interf: ts.InterfaceDeclaration) {
		return interf.getExtends().some((e) => e.getText().includes(value))
	}
	return isExtending
}

export function createMetadataObject() {
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

export function isArbitrary(interf: ts.InterfaceDeclaration) {
	return interf
		.getMembers()
		.some((type) => type.getText().replace(';', '') === '[key: string]: any')
}

export function setArbitrary(interf: ts.InterfaceDeclaration) {
	interf
		.addMember({
			name: '[key: string]',
			type: 'any',
			kind: ts.StructureKind.PropertySignature,
		})
		.formatText({
			semicolons: ts.ts.SemicolonPreference.Remove,
		})
	return interf
}

export function setPropertyPosition(
	getFn: (val: ts.TypeElementTypes) => boolean,
	interf: ts.InterfaceDeclaration,
	index: number | 'last',
): ts.InterfaceDeclaration

export function setPropertyPosition(
	getFn: (val: ts.TypeElementTypes) => boolean,
	members: ts.TypeElementTypes[],
	index: number | 'last',
): ts.TypeElementTypes[]

export function setPropertyPosition(
	getFn: (val: ts.TypeElementTypes) => boolean,
	n: ts.InterfaceDeclaration | ts.TypeElementTypes[],
	index: number | 'last',
) {
	const members = u.isArr(n) ? n : n.getMembers()
	for (const member of members) {
		if (getFn(member)) {
			member.setOrder(index === 'last' ? members.length - 1 : index)
			break
		}
	}
	if (u.isArr(n)) return members
	return n
}

export function sortAlphabetically<V = any>(
	getComparerValue: (node: V) => any,
	items: V[],
) {
	return items.sort((a, b) => {
		const val1 = getComparerValue(a)
		const val2 = getComparerValue(b)
		if (val1 < val2) return -1
		if (val1 === val2) return 0
		return 1
	}) as V[]
}

export function sortInterfaceProperties(interf: ts.InterfaceDeclaration) {
	const properties = sortAlphabetically(
		(node) => node.getName(),
		interf.getProperties(),
	)
	const numNodes = properties.length
	for (let index = 0; index < numNodes; index++) {
		properties[index].setOrder(index)
	}
}
