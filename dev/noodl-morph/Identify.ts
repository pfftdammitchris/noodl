import chalk from 'chalk'
import yaml, { createNode } from 'yaml'
import { findPair } from 'yaml/util'
import flowRight from 'lodash/flowRight'
import { Node, Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import globby from 'globby'
import fs from 'fs-extra'
import path from 'path'
import { IdentifyFn } from '../../src/types'
import * as u from '../../src/utils/common'
import * as c from '../../src/constants'

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

const Identify = (function () {
	const action = {
		any: u.onYAMLMap(u.hasKey('actionType')),
		builtIn: hasActionTypeEqualTo(c.action.BUILTIN),
		evalObject: hasActionTypeEqualTo(c.action.EVALOBJECT),
		pageJump: hasActionTypeEqualTo(c.action.PAGEJUMP),
		popUp: hasActionTypeEqualTo(c.action.POPUP),
		popUpDismiss: hasActionTypeEqualTo(c.action.POPUPDISMISS),
		refresh: hasActionTypeEqualTo(c.action.REFRESH),
		saveObject: hasActionTypeEqualTo(c.action.SAVEOBJECT),
		updateObject: hasActionTypeEqualTo(c.action.UPDATEOBJECT),
	}

	const actionChain = u.onYAMLSeq((node) =>
		[o.action.any, o.fold.emit, o.fold.goto, o.fold.toast].some((fn) =>
			node.items.some((v) => fn(v)),
		),
	)

	const component = {
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
	}

	const fold = {
		emit: u.onYAMLMap(u.hasKey('emit')),
		goto: u.onYAMLMap(u.hasKey('goto')),
		if: u.onYAMLMap(u.hasKey('if')),
		init: u.onYAMLMap(u.hasKey('init')),
		toast: u.onYAMLMap(u.hasKey('toast')),
	}

	const o = {
		action,
		actionChain,
		component,
		boolean: u.onScalar((node) => typeof node.value === 'boolean'),
		booleanTrue: u.onScalar((node) => typeof node.value === 'boolean'),
		booleanFalse: u.onScalar((node) => typeof node.value === 'boolean'),
		continue: u.onScalar((node) => node.value === 'continue'),
		init(v: unknown) {
			return u.onYAMLSeq((node) =>
				[o.fold.if].some((fn) => node.items.some(fn)),
			)(v)
		},
		reference: u.onScalar(scalarStartsWith('.', '=', '@')),
		// localReference: u.onScalar(scalarStartsWith)
		fold,
	}

	return o
})()

export default Identify
