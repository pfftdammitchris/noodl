import * as u from '@jsmanifest/utils'
import {
	componentTypes,
	minimalStyleKeys,
	minimalBorderStyleKeys,
} from './_internal/constants'
import { ComponentType } from './constantTypes'
import { StyleObject } from './styleTypes'
import * as T from '.'
import * as i from './_internal'

export const Identify = (function () {
	const composeSomes =
		(...fns: any[]) =>
		(arg: any) =>
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
			openCamera(v: unknown): v is T.OpenCameraActionObject {
				return u.isObj(v) && v.actionType === 'openCamera'
			},
			openPhotoLibrary(v: unknown): v is T.OpenPhotoLibraryActionObject {
				return u.isObj(v) && v.actionType === 'openPhotoLibrary'
			},
			openDocumentManager(v: unknown): v is T.OpenDocumentManagerActionObject {
				return u.isObj(v) && v.actionType === 'openDocumentManager'
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
				u.isArr(v) &&
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
			pluginBodyTop(value: unknown): value is T.PluginBodyTopComponentObject {
				return u.isObj(value) && value.type === 'pluginBodyTop'
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
		ecosObj: {
			audio(v: unknown) {},
			doc(v: unknown) {},
			font(v: unknown) {},
			image(v: unknown) {},
			message(v: unknown) {},
			model(v: unknown) {},
			multipart(v: unknown) {},
			note(
				v: unknown,
			): v is T.EcosDocument<
				T.NameField<T.MimeType.Pdf | T.MimeType.Json>,
				T.DocMediaType
			> {
				return i.hasNameField(v) && v.name.type === 'application/json'
			},
			other(v: unknown) {},
			text(v: unknown) {},
			video(v: unknown) {},
		},
		emit(v: unknown): v is T.EmitObject {
			return u.isObj(v) && 'actions' in v
		},
		goto(v: unknown): v is T.GotoObject {
			return u.isObj(v) && 'goto' in v
		},
		if(v: unknown): v is T.IfObject {
			return u.isObj(v) && 'if' in v
		},
		mediaType: {
			audio(v: unknown): v is T.AudioMediaType {
				return v == 2
			},
			doc(v: unknown): v is T.DocMediaType {
				return v == 1
			},
			font(v: unknown): v is T.FontMediaType {
				return v == 3
			},
			image(v: unknown): v is T.ImageMediaType {
				return v == 4
			},
			message(v: unknown): v is T.MessageMediaType {
				return v == 5
			},
			model(v: unknown): v is T.ModelMediaType {
				return v == 6
			},
			multipart(v: unknown): v is T.MultipartMediaType {
				return v == 7
			},
			other(v: unknown): v is T.OtherMediaType {
				return v == 0
			},
			text(v: unknown): v is T.TextMediaType {
				return v == 8
			},
			video(v: unknown): v is T.VideoMediaType {
				return v == 9
			},
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
				(i.isImg(v) || i.isJs(v) || i.isHtml(v) || i.isPdf(v) || i.isVid(v))
			)
		},
		style: {
			any(v: unknown): v is StyleObject {
				return u.isObj(v) && i.hasAnyKeys(minimalStyleKeys, v)
			},
			border(v: unknown) {
				return (
					u.isObj(v) &&
					i.hasAnyKeys(['color', 'style', 'width'], v) &&
					!i.hasAnyKeys(
						i.excludeKeys(minimalStyleKeys, minimalBorderStyleKeys),
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
		): v is (T.ActionObject | T.EmitObjectFold | T.GotoObject)[] {
			return u.isArr(v) && v.some(composeSomes(o.action.any, o.emit, o.goto))
		},
		component: u.assign(
			{
				any(v: unknown): v is T.AnyComponentObject {
					return (
						u.isObj(v) &&
						'type' in v &&
						componentTypes.some((t) => v.type === t)
					)
				},
			},
			u.assign(
				{} as {
					[K in ComponentType]: <K extends T.ComponentType>(
						v: unknown,
					) => v is Omit<T.AnyComponentObject, 'type'> & { type: K }
				},
				componentTypes.reduce(
					(acc, type) =>
						u.assign(acc, {
							[type]: (v: unknown) => u.isObj(v) && v['type'] === type,
						}),
					{},
				),
			),
		),
		emit<O extends Record<string, any>>(
			value: unknown,
		): value is T.EmitObjectFold & O {
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
