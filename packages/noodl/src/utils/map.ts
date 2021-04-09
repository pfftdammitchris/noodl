import { action, component, ComponentType } from 'noodl-types'
import { YAMLMap } from 'yaml'
import * as u from './internal'

/* -------------------------------------------------------
	---- ACTIONS
-------------------------------------------------------- */

export function isActionLike(node: YAMLMap) {
	return node.has('actionType')
}

export function isBuiltInAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.BUILTIN)
}

export function isEvalObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.EVALOBJECT)
}

export function isPageJumpAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.PAGEJUMP)
}

export function isPopUpAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.POPUP)
}

export function isPopUpDismissAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.POPUPDISMISS)
}

export function isRefreshAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.REFRESH)
}

export function isSaveObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.SAVEOBJECT)
}

export function isUpdateObjectAction(node: YAMLMap) {
	return hasActionTypeEqualTo(node, action.UPDATEOBJECT)
}

/* -------------------------------------------------------
	---- COMPONENTS
-------------------------------------------------------- */

export function isComponentLike(node: YAMLMap) {
	if (!node.has('type')) return false
	if (u.isMap(node.get('style'))) return true
	if (u.isSeq(node.get('children'))) return true
	return false
}

export const isComponent = (function () {
	const componentTypes = Object.values(component)
	return (node: YAMLMap) => {
		const type = node.get('type') as ComponentType
		return typeof type === 'string'
			? componentTypes.includes(type as any)
			: false
	}
})()

export function isButtonComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.BUTTON)
}

export function isDividerComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.DIVIDER)
}

export function isFooterComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.FOOTER)
}

export function isHeaderComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.HEADER)
}

export function isImageComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.IMAGE)
}

export function isLabelComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.LABEL)
}

export function isListComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.LIST)
}

export function isListItemComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.LISTITEM)
}

export function isPluginComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.PLUGIN)
}

export function isPluginHeadComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.PLUGINHEAD)
}

export function isPluginBodyTailComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.PLUGINBODYTAIL)
}

export function isPopUpComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.POPUP)
}

export function isRegisterComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.REGISTER)
}

export function isSelectComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.SELECT)
}

export function isScrollViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.SCROLLVIEW)
}

export function isTextFieldComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.TEXTFIELD)
}

export function isTextViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.TEXTVIEW)
}

export function isVideoComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.VIDEO)
}

export function isViewComponent(node: YAMLMap) {
	return hasComponentTypeEqualTo(node, component.VIEW)
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
