import { ComponentType } from 'noodl-types'
import { YAMLMap } from 'yaml/types'
import * as c from '../../../src/constants'
import * as d from '../../../src/utils/doc'
import * as u from './internal'

/* -------------------------------------------------------
	---- ACTIONS
-------------------------------------------------------- */

export function isActionLike(node: YAMLMap) {
	return d.hasKey(node, 'actionType')
}

export function isBuiltInAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.BUILTIN)
}

export function isEvalObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.EVALOBJECT)
}

export function isPageJumpAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.PAGEJUMP)
}

export function isPopUpAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.POPUP)
}

export function isPopUpDismissAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.POPUPDISMISS)
}

export function isRefreshAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.REFRESH)
}

export function isSaveObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.SAVEOBJECT)
}

export function isUpdateObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, c.action.UPDATEOBJECT)
}

/* -------------------------------------------------------
	---- COMPONENTS
-------------------------------------------------------- */

export function isComponentLike(node: YAMLMap) {
	if (!node.has('type')) return false
	if (d.isYAMLMap(node.get('style'))) return true
	if (d.isYAMLSeq(node.get('children'))) return true
	return false
}

export const isComponent = (function () {
	const componentTypes = Object.values(c.component)
	return (node: YAMLMap) => {
		const type = node.get('type') as ComponentType
		return typeof type === 'string'
			? componentTypes.includes(type as any)
			: false
	}
})()

export function isButtonComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.BUTTON)
}

export function isDividerComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.DIVIDER)
}

export function isFooterComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.FOOTER)
}

export function isHeaderComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.HEADER)
}

export function isImageComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.IMAGE)
}

export function isLabelComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.LABEL)
}

export function isListComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.LIST)
}

export function isListItemComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.LISTITEM)
}

export function isPluginComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.PLUGIN)
}

export function isPluginHeadComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.PLUGINHEAD)
}

export function isPluginBodyTailComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.PLUGINBODYTAIL)
}

export function isPopUpComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.POPUP)
}

export function isRegisterComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.REGISTER)
}

export function isSelectComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.SELECT)
}

export function isScrollViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.SCROLLVIEW)
}

export function isTextFieldComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.TEXTFIELD)
}

export function isTextViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.TEXTVIEW)
}

export function isVideoComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.VIDEO)
}

export function isViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, c.component.VIEW)
}

/* -------------------------------------------------------
	---- OTHER
-------------------------------------------------------- */

export function hasActionTypeEqualTo(node: YAMLMap, value: string) {
	return node.get('actionType') === value
}

export function hasComponentTypeEqualTo(node: YAMLMap, value: string) {
	return node.get('type') === value
}

export function isEmitObject(node: YAMLMap) {
	return node.has('emit')
}

export function isGotoObject(node: YAMLMap) {
	return node.has('goto')
}

export function isIfObject(node: YAMLMap) {
	return node.has('if')
}

export function isInitObject(node: YAMLMap) {
	return node.has('init')
}

export function isToastObject(node: YAMLMap) {
	return node.has('toast')
}
