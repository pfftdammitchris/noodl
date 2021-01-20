import { minimalStyleKeys, minimalBorderStyleKeys } from './_internal/constants'
import * as T from '.'
import * as u from './_internal'
import { StyleObject } from './styleTypes'

export const identify = (function () {
	const o = {
		action: {
			any(v: unknown): v is T.ActionObject {
				return u.isPlainObject(v) && 'actionType' in v
			},
			builtIn(v: unknown): v is T.BuiltInActionObject {
				return (
					u.isPlainObject(v) && ('funcName' in v || v.actionType === 'builtIn')
				)
			},
			evalObject(v: unknown): v is T.EvalActionObject {
				return u.isPlainObject(v) && v.actionType === 'evalObject'
			},o
			pageJump(v: unknown): v is T.PageJumpActionObject {
				return u.isPlainObject(v) && v.actionType === 'pageJump'
			},
			popUp(v: unknown): v is T.PopupActionObject {
				return u.isPlainObject(v) && v.actionType === 'popUp'
			},
			popUpDismiss(v: unknown): v is T.PopupDismissActionObject {
				return u.isPlainObject(v) && v.actionType === 'popUpDismiss'
			},
			refresh(v: unknown): v is T.RefreshActionObject {
				return u.isPlainObject(v) && v.actionType === 'refresh'
			},
			saveObject(v: unknown): v is T.SaveActionObject {
				return u.isPlainObject(v) && v.actionType === 'saveObject'
			},
			updateObject(v: unknown): v is T.UpdateActionObject {
				return u.isPlainObject(v) && v.actionType === 'updateObject'
			},
		},
		actionChain(v: unknown) {
			return (
				Array.isArray(v) &&
				[o.action.any, o.emit, o.goto, o.toast].some((fn) => v.some(fn))
			)
		},
		/**
		 * Returns true if the value is a NOODL boolean. A value is a NOODL boolean
		 * if the value is truthy, true, "true", false, or "false"
		 * @param { any } value
		 */
		isBoolean(value: unknown) {
			return o.isBooleanTrue(value) || o.isBooleanFalse(value)
		},
		isBooleanTrue(value: unknown): value is true | 'true' {
			return value === true || value === 'true'
		},
		isBooleanFalse(value: unknown): value is false | 'false' {
			return value === false || value === 'false'
		},
		component: {
			button(value: unknown): value is T.ButtonComponentObject {
				return u.isPlainObject(value) && value.type === 'button'
			},
			divider(value: unknown): value is T.DividerComponentObject {
				return u.isPlainObject(value) && value.type === 'divider'
			},
			footer(value: unknown): value is T.FooterComponentObject {
				return u.isPlainObject(value) && value.type === 'footer'
			},
			header(value: unknown): value is T.HeaderComponentObject {
				return u.isPlainObject(value) && value.type === 'header'
			},
			image(value: unknown): value is T.ImageComponentObject {
				return u.isPlainObject(value) && value.type === 'image'
			},
			label(value: unknown): value is T.LabelComponentObject {
				return u.isPlainObject(value) && value.type === 'label'
			},
			list(value: unknown): value is T.ListComponentObject {
				return u.isPlainObject(value) && value.type === 'list'
			},
			listItem(value: unknown): value is T.ListItemComponentObject {
				return u.isPlainObject(value) && value.type === 'listItem'
			},
			plugin(value: unknown): value is T.PluginComponentObject {
				return u.isPlainObject(value) && value.type === 'plugin'
			},
			pluginHead(value: unknown): value is T.PluginHeadComponentObject {
				return u.isPlainObject(value) && value.type === 'pluginHead'
			},
			pluginBodyTail(value: unknown): value is T.PluginBodyTailComponentObject {
				return u.isPlainObject(value) && value.type === 'pluginBodyTail'
			},
			popUp(value: unknown): value is T.PopUpComponentObject {
				return u.isPlainObject(value) && value.type === 'popUp'
			},
			register(value: unknown): value is T.RegisterComponentObject {
				return u.isPlainObject(value) && value.type === 'register'
			},
			select(value: unknown): value is T.SelectComponentObject {
				return u.isPlainObject(value) && value.type === 'select'
			},
			scrollView(value: unknown): value is T.ScrollViewComponentObject {
				return u.isPlainObject(value) && value.type === 'scrollView'
			},
			textField(value: unknown): value is T.TextFieldComponentObject {
				return u.isPlainObject(value) && value.type === 'textField'
			},
			textView(value: unknown): value is T.TextViewComponentObject {
				return u.isPlainObject(value) && value.type === 'textView'
			},
			video(value: unknown): value is T.VideoComponentObject {
				return u.isPlainObject(value) && value.type === 'video'
			},
			view(value: unknown): value is T.ViewComponentObject {
				return u.isPlainObject(value) && value.type === 'view'
			},
		},
		emit(v: unknown): v is T.EmitObject {
			return u.isPlainObject(v) && 'emit' in v
		},
		goto(v: unknown): v is T.GotoObject {
			return u.isPlainObject(v) && 'goto' in v
		},
		if(v: unknown): v is T.IfObject {
			return u.isPlainObject(v) && 'if' in v
		},
		reference(value: unknown): value is string {
			if (typeof value !== 'string') return false
			if (value.startsWith('.')) return true
			if (value.startsWith('=')) return true
			if (value.startsWith('@')) return true
			if (value.endsWith('@')) return true
			return false
		},
		url(v: unknown): v is string {
			return (
				typeof v === 'string' &&
				!v.startsWith('.') &&
				(u.isImg(v) || u.isJs(v) || u.isHtml(v) || u.isPdf(v) || u.isVid(v))
			)
		},
		style: {
			any(v: unknown): v is StyleObject {
				return u.isPlainObject(v) && u.hasAnyKeys(minimalStyleKeys, v)
			},
			border(v: unknown) {
				return (
					u.isPlainObject(v) &&
					u.hasAnyKeys(['color', 'style', 'width'], v) &&
					!u.hasAnyKeys(
						u.excludeKeys(minimalStyleKeys, minimalBorderStyleKeys),
						v,
					)
				)
			},
		},
		toast(value: unknown): value is { toast: T.ToastObject } {
			return u.isPlainObject(value) && 'message' in value
		},
	}

	const paths = {
		actionChain() {},
		component: {
			any() {},
			button() {},
		},
		emit(value: unknown): value is { emit: T.EmitObject } {
			return u.isPlainObject(value) && 'emit' in value
		},
		goto(value: unknown): value is { goto: T.GotoUrl | T.GotoObject } {
			return u.isPlainObject(value) && 'goto' in value
		},
		path(value: unknown): value is { path: T.Path } {
			return u.isPlainObject(value) && 'path' in value
		},
		style: {
			any() {},
			border() {},
		},
		textFunc(value: unknown): value is { path: T.Path } {
			return u.isPlainObject(value) && 'path' in value
		},
		toast(value: unknown): value is { toast: T.ToastObject } {
			return u.isPlainObject(value) && 'toast' in value
		},
	}

	return {
		...o,
		paths,
	}
})()
