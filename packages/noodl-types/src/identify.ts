import {
	ActionObject,
	BuiltInActionObject,
	EvalActionObject,
	PageJumpActionObject,
	PopupActionObject,
	PopupDismissActionObject,
	RefreshActionObject,
	SaveActionObject,
	UpdateActionObject,
} from './actionTypes'
import { ActionType } from './constantTypes'
import {
	ButtonComponentObject,
	DividerComponentObject,
	FooterComponentObject,
	HeaderComponentObject,
	ImageComponentObject,
	LabelComponentObject,
	ListComponentObject,
	ListItemComponentObject,
	PluginBodyTailComponentObject,
	PluginComponentObject,
	PluginHeadComponentObject,
	PopUpComponentObject,
	RegisterComponentObject,
	ScrollViewComponentObject,
	SelectComponentObject,
	TextFieldComponentObject,
	TextViewComponentObject,
	VideoComponentObject,
	ViewComponentObject,
} from './componentTypes'
import { EmitObject, GotoObject, GotoUrl } from './uncategorizedTypes'
import {
	excludeKeys,
	hasAnyKeys,
	isPlainObject,
	PlainObject,
} from './_internal'
import { minimalStyleKeys, minimalBorderStyleKeys } from './_internal/constants'

export const identify = (function () {
	function isActionType<Type extends ActionType>(
		actionType: Type,
		value: PlainObject,
	) {
		return value.actionType === actionType
	}

	const o = {
		action: {
			any(v: unknown) {
				return isPlainObject(v) && 'actionType' in v
			},
			builtIn(v: unknown): v is BuiltInActionObject {
				return (
					isPlainObject(v) && ('funcName' in v || isActionType('builtIn', v))
				)
			},
			evalObject(v: unknown): v is EvalActionObject {
				return isPlainObject(v) && isActionType('evalObject', v)
			},
			pageJump(v: unknown): v is PageJumpActionObject {
				return isPlainObject(v) && isActionType('pageJump', v)
			},
			popUp(v: unknown): v is PopupActionObject {
				return isPlainObject(v) && isActionType('popUp', v)
			},
			popUpDismiss(v: unknown): v is PopupDismissActionObject {
				return isPlainObject(v) && isActionType('popUpDismiss', v)
			},
			refresh(v: unknown): v is RefreshActionObject {
				return isPlainObject(v) && isActionType('refresh', v)
			},
			saveObject(v: unknown): v is SaveActionObject {
				return isPlainObject(v) && isActionType('saveObject', v)
			},
			updateObject(v: unknown): v is UpdateActionObject {
				return isPlainObject(v) && isActionType('updateObject', v)
			},
		},
		actionChain(v: unknown): v is ActionObject[] {
			return Array.isArray(v) && v.some(o.action.any)
		},
		component: {
			button(value: unknown): value is ButtonComponentObject {
				return isPlainObject(value) && value.type === 'button'
			},
			divider(value: unknown): value is DividerComponentObject {
				return isPlainObject(value) && value.type === 'divider'
			},
			footer(value: unknown): value is FooterComponentObject {
				return isPlainObject(value) && value.type === 'footer'
			},
			header(value: unknown): value is HeaderComponentObject {
				return isPlainObject(value) && value.type === 'header'
			},
			image(value: unknown): value is ImageComponentObject {
				return isPlainObject(value) && value.type === 'image'
			},
			label(value: unknown): value is LabelComponentObject {
				return isPlainObject(value) && value.type === 'label'
			},
			list(value: unknown): value is ListComponentObject {
				return isPlainObject(value) && value.type === 'list'
			},
			listItem(value: unknown): value is ListItemComponentObject {
				return isPlainObject(value) && value.type === 'listItem'
			},
			plugin(value: unknown): value is PluginComponentObject {
				return isPlainObject(value) && value.type === 'plugin'
			},
			pluginHead(value: unknown): value is PluginHeadComponentObject {
				return isPlainObject(value) && value.type === 'pluginHead'
			},
			pluginBodyTail(value: unknown): value is PluginBodyTailComponentObject {
				return isPlainObject(value) && value.type === 'pluginBodyTail'
			},
			popUp(value: unknown): value is PopUpComponentObject {
				return isPlainObject(value) && value.type === 'popUp'
			},
			register(value: unknown): value is RegisterComponentObject {
				return isPlainObject(value) && value.type === 'register'
			},
			select(value: unknown): value is SelectComponentObject {
				return isPlainObject(value) && value.type === 'select'
			},
			scrollView(value: unknown): value is ScrollViewComponentObject {
				return isPlainObject(value) && value.type === 'scrollView'
			},
			textField(value: unknown): value is TextFieldComponentObject {
				return isPlainObject(value) && value.type === 'textField'
			},
			textView(value: unknown): value is TextViewComponentObject {
				return isPlainObject(value) && value.type === 'textView'
			},
			video(value: unknown): value is VideoComponentObject {
				return isPlainObject(value) && value.type === 'video'
			},
			view(value: unknown): value is ViewComponentObject {
				return isPlainObject(value) && value.type === 'view'
			},
		},
		emit(v: unknown): v is EmitObject {
			return isPlainObject(v) && 'emit' in v
		},
		goto(v: unknown): v is GotoUrl | GotoObject {
			return o.gotoUrl(v) || o.gotoObject(v)
		},
		gotoUrl(v: unknown): v is GotoUrl {
			return typeof v === 'string'
		},
		gotoObject(v: unknown): v is GotoObject {
			return isPlainObject(v) && 'goto' in v
		},
		style: {
			any(v: unknown) {
				return isPlainObject(v) && hasAnyKeys(minimalStyleKeys, v)
			},
			border(v: unknown) {
				return (
					isPlainObject(v) &&
					hasAnyKeys(['color', 'style', 'width'], v) &&
					!hasAnyKeys(excludeKeys(minimalStyleKeys, minimalBorderStyleKeys), v)
				)
			},
		},
	}

	return o
})()
