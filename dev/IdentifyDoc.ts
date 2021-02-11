import chalk from 'chalk'
import yaml, { createNode } from 'yaml'
import { findPair } from 'yaml/util'
import { Identify } from 'noodl-types'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import globby from 'globby'
import fs from 'fs-extra'
import path from 'path'
import * as u from '../src/utils/common'
import * as c from '../src/constants'
import { IdentifyFn, YAMLNode } from '../src/types'

function hasActionTypeEqualTo(value: string) {
	return u.onYAMLMap(u.hasKeyEqualTo('actionType', value))
}

function hasComponentTypeEqualTo(value: string) {
	return u.onYAMLMap(u.hasKeyEqualTo('type', value))
}

function scalarStartsWith(value: string[]): IdentifyFn
function scalarStartsWith(...value: string[]): IdentifyFn
function scalarStartsWith(...value: [string[]] | string[]) {
	if (Array.isArray(value[0])) value = value[0]
	return (node: unknown) => {
		return (
			u.isScalar(node) &&
			typeof node.value === 'string' &&
			value.some((v: any) => node.value.startsWith(v))
		)
	}
}

const IdentifyDoc = (function () {
	const o = {
		action: {
			any: u.onYAMLMap(u.hasKey('actionType')),
			builtIn: hasActionTypeEqualTo(c.action.BUILTIN),
			evalObject: hasActionTypeEqualTo(c.action.EVALOBJECT),
			pageJump: hasActionTypeEqualTo(c.action.PAGEJUMP),
			popUp: hasActionTypeEqualTo(c.action.POPUP),
			popUpDismiss: hasActionTypeEqualTo(c.action.POPUPDISMISS),
			refresh: hasActionTypeEqualTo(c.action.REFRESH),
			saveObject: hasActionTypeEqualTo(c.action.SAVEOBJECT),
			updateObject: hasActionTypeEqualTo(c.action.UPDATEOBJECT),
		},
		actionChain: u.onYAMLSeq((node) =>
			[o.action.any, o.fold.emit, o.fold.goto, o.fold.toast].some((fn) =>
				node.items.some((v) => fn(v)),
			),
		),
		component: {
			button: hasComponentTypeEqualTo(c.component.BUTTON),
			divider: hasComponentTypeEqualTo(c.component.DIVIDER),
			footer: hasComponentTypeEqualTo(c.component.FOOTER),
			header: hasComponentTypeEqualTo(c.component.HEADER),
			image: hasComponentTypeEqualTo(c.component.IMAGE),
			label: hasComponentTypeEqualTo(c.component.LABEL),
			list: hasComponentTypeEqualTo(c.component.LIST),
			listItem: hasComponentTypeEqualTo(c.component.LISTITEM),
			plugin: hasComponentTypeEqualTo(c.component.PLUGIN),
			pluginHead: hasComponentTypeEqualTo(c.component.PLUGINHEAD),
			pluginBodyTail: hasComponentTypeEqualTo(c.component.PLUGINBODYTAIL),
			popUp: hasComponentTypeEqualTo(c.component.POPUP),
			register: hasComponentTypeEqualTo(c.component.REGISTER),
			select: hasComponentTypeEqualTo(c.component.SELECT),
			scrollView: hasComponentTypeEqualTo(c.component.SCROLLVIEW),
			textField: hasComponentTypeEqualTo(c.component.TEXTFIELD),
			textView: hasComponentTypeEqualTo(c.component.TEXTVIEW),
			video: hasComponentTypeEqualTo(c.component.VIDEO),
			view: hasComponentTypeEqualTo(c.component.VIEW),
		},
		boolean: u.onScalar((node) => typeof node.value === 'boolean'),
		booleanTrue: u.onScalar((node) => typeof node.value === 'boolean'),
		booleanFalse: u.onScalar((node) => typeof node.value === 'boolean'),
		reference: u.onScalar(scalarStartsWith('.', '=', '@')),
		fold: {
			emit: u.onYAMLMap(u.hasKey('emit')),
			goto: u.onYAMLMap(u.hasKey('goto')),
			if: u.onYAMLMap(u.hasKey('if')),
			toast: u.onYAMLMap(u.hasKey('toast')),
		},
	}

	return o
})()

const newDoc = new yaml.Document()

const value = newDoc.createNode([
	{},
	'fsafas',
	{ actionType: 'pageJumpd' },
]) as YAMLSeq

const test = IdentifyDoc.actionChain(value)

console.log(IdentifyDoc.reference(new Scalar('=.=bc')))

export default IdentifyDoc
