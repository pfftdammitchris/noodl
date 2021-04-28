import {
	componentTypes,
	minimalStyleKeys,
	minimalBorderStyleKeys,
} from './_internal/constants'
import { ComponentType } from './constantTypes'
import { StyleObject } from './styleTypes'
import * as T from '.'
import * as u from './_internal'

export const Identify = (function () {
	const composeSomes = (...fns: any[]) => (arg: any) =>
		fns.some((fn) => fn(arg))

	const o = {
		action: {
			any(v: unknown): v is T.ActionObject {
				return u.isObj(v) && 'actionType' in v
			},
			builtIn(v: unknown): v is T.BuiltInActionObject {
				return u.isObj(v) && ('funcName' in v || v.actionType === 'builtIn')
			},
			evalObject(v: unknown): v is T.EvalActionObject {
				return u.isObj(v) && v.actionType === 'evalObject'
			},
			pageJump(v: unknown): v is T.PageJumpActionObject {
				return u.isObj(v) && v.actionType === 'pageJump'
			},
			popUp(v: unknown): v is T.PopupActionObject {
				return u.isObj(v) && v.actionType === 'popUp'
			},
			popUpDismiss(v: unknown): v is T.PopupDismissActionObject {
				return u.isObj(v) && v.actionType === 'popUpDismiss'
			},
			refresh(v: unknown): v is T.RefreshActionObject {
				return u.isObj(v) && v.actionType === 'refresh'
			},
			saveObject(v: unknown): v is T.SaveActionObject {
				return u.isObj(v) && v.actionType === 'saveObject'
			},
			updateObject(v: unknown): v is T.UpdateActionObject {
				return u.isObj(v) && v.actionType === 'updateObject'
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
				return u.isObj(value) && value.type === 'button'
			},
			divider(value: unknown): value is T.DividerComponentObject {
				return u.isObj(value) && value.type === 'divider'
			},
			ecosDoc(value: unknown): value is T.EcosDocComponentObject {
				return u.isObj(value) && value.type === 'ecosDoc'
			},
			footer(value: unknown): value is T.FooterComponentObject {
				return u.isObj(value) && value.type === 'footer'
			},
			header(value: unknown): value is T.HeaderComponentObject {
				return u.isObj(value) && value.type === 'header'
			},
			image(value: unknown): value is T.ImageComponentObject {
				return u.isObj(value) && value.type === 'image'
			},
			label(value: unknown): value is T.LabelComponentObject {
				return u.isObj(value) && value.type === 'label'
			},
			list(value: unknown): value is T.ListComponentObject {
				return u.isObj(value) && value.type === 'list'
			},
			listLike(
				value: unknown,
			): value is T.ListComponentObject | T.ChatListComponentObject {
				return u.isObj(value) && ['chatList', 'list'].includes(value.type)
			},
			listItem(value: unknown): value is T.ListItemComponentObject {
				return u.isObj(value) && value.type === 'listItem'
			},
			map(value: unknown): value is T.MapComponentObject {
				return u.isObj(value) && value.type === 'map'
			},
			page(value: unknown): value is T.PageComponentObject {
				return u.isObj(value) && value.type === 'page'
			},
			plugin(value: unknown): value is T.PluginComponentObject {
				return u.isObj(value) && value.type === 'plugin'
			},
			pluginHead(value: unknown): value is T.PluginHeadComponentObject {
				return u.isObj(value) && value.type === 'pluginHead'
			},
			pluginBodyTail(value: unknown): value is T.PluginBodyTailComponentObject {
				return u.isObj(value) && value.type === 'pluginBodyTail'
			},
			popUp(value: unknown): value is T.PopUpComponentObject {
				return u.isObj(value) && value.type === 'popUp'
			},
			register(value: unknown): value is T.RegisterComponentObject {
				return u.isObj(value) && value.type === 'register'
			},
			select(value: unknown): value is T.SelectComponentObject {
				return u.isObj(value) && value.type === 'select'
			},
			scrollView(value: unknown): value is T.ScrollViewComponentObject {
				return u.isObj(value) && value.type === 'scrollView'
			},
			textField(value: unknown): value is T.TextFieldComponentObject {
				return u.isObj(value) && value.type === 'textField'
			},
			textView(value: unknown): value is T.TextViewComponentObject {
				return u.isObj(value) && value.type === 'textView'
			},
			video(value: unknown): value is T.VideoComponentObject {
				return u.isObj(value) && value.type === 'video'
			},
			view(value: unknown): value is T.ViewComponentObject {
				return u.isObj(value) && value.type === 'view'
			},
		},
		emit(v: unknown): v is T.EmitObject {
			return u.isObj(v) && 'emit' in v
		},
		goto(v: unknown): v is T.GotoObject {
			return u.isObj(v) && 'goto' in v
		},
		if(v: unknown): v is T.IfObject {
			return u.isObj(v) && 'if' in v
		},
		reference(value: unknown): value is string {
			if (typeof value !== 'string') return false
			if (value.startsWith('.')) return true
			if (value.startsWith('=')) return true
			if (value.startsWith('@')) return true
			if (value.endsWith('@')) return true
			return false
		},
		textBoard(v: unknown) {
			return u.isArr(v) && v.some((o) => o.textBoardItem)
		},
		textBoardItem(v: unknown) {
			if (u.isObj(v)) return 'br' in v
			if (u.isStr(v)) return v === 'br'
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
				return u.isObj(v) && u.hasAnyKeys(minimalStyleKeys, v)
			},
			border(v: unknown) {
				return (
					u.isObj(v) &&
					u.hasAnyKeys(['color', 'style', 'width'], v) &&
					!u.hasAnyKeys(
						u.excludeKeys(minimalStyleKeys, minimalBorderStyleKeys),
						v,
					)
				)
			},
		},
		toast(value: unknown): value is { toast: T.ToastObject } {
			return u.isObj(value) && 'message' in value
		},
	}

	const folds = {
		actionChain(
			v: unknown,
		): v is (T.ActionObject | T.EmitObject | T.GotoObject)[] {
			return u.isArr(v) && v.some(composeSomes(o.action.any, o.emit, o.goto))
		},
		component: Object.assign(
			{
				any(v: unknown): v is T.AnyComponentObject {
					return (
						u.isObj(v) &&
						'type' in v &&
						componentTypes.some((t) => v.type === t)
					)
				},
			},
			Object.assign(
				{} as {
					[K in ComponentType]: <K extends T.ComponentType>(
						v: unknown,
					) => v is Omit<T.AnyComponentObject, 'type'> & { type: K }
				},
				componentTypes.reduce(
					(acc, type) =>
						Object.assign(acc, {
							[type](v: unknown) {
								return u.isObj(v) && v['type'] === type
							},
						}),
					{},
				),
			),
		),
		emit(value: unknown): value is { emit: T.EmitObject } {
			return u.isObj(value) && 'emit' in value
		},
		goto(value: unknown): value is { goto: T.GotoUrl | T.GotoObject } {
			return u.isObj(value) && 'goto' in value
		},
		path(value: unknown): value is { path: T.Path } {
			return u.isObj(value) && 'path' in value
		},
		style: {
			any() {},
			border() {},
		},
		textFunc(value: unknown): value is { path: T.Path } {
			return u.isObj(value) && 'text=func' in value
		},
		toast(value: unknown): value is { toast: T.ToastObject } {
			return u.isObj(value) && 'toast' in value
		},
	}

	return {
		...o,
		folds,
	}
})()
