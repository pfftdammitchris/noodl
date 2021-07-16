import {
	componentTypes,
	minimalStyleKeys,
	minimalBorderStyleKeys,
} from './_internal/constants'
import { ComponentType } from './constantTypes'
import { StyleObject } from './styleTypes'
import * as t from '.'
import * as i from './_internal'

export const Identify = (function () {
	const composeSomes =
		(...fns: any[]) =>
		(arg: any) =>
			fns.some((fn) => fn(arg))

	const o = {
		rootConfig(v: unknown): v is t.RootConfig {
			return (
				i.isObj(v) &&
				['apiHost', 'apiPort', 'appApiHost'].every((key) => key in v)
			)
		},
		appConfig(v: unknown): v is t.AppConfig {
			return (
				i.isObj(v) && ['preload', 'page', 'startPage'].every((key) => key in v)
			)
		},
		action: {
			any(v: unknown): v is t.ActionObject {
				return i.isObj(v) && 'actionType' in v
			},
			builtIn(v: unknown): v is t.BuiltInActionObject {
				return i.isObj(v) && ('funcName' in v || v.actionType === 'builtIn')
			},
			evalObject(v: unknown): v is t.EvalActionObject {
				return i.isObj(v) && v.actionType === 'evalObject'
			},
			openCamera(v: unknown): v is t.OpenCameraActionObject {
				return i.isObj(v) && v.actionType === 'openCamera'
			},
			openPhotoLibrary(v: unknown): v is t.OpenPhotoLibraryActionObject {
				return i.isObj(v) && v.actionType === 'openPhotoLibrary'
			},
			openDocumentManager(v: unknown): v is t.OpenDocumentManagerActionObject {
				return i.isObj(v) && v.actionType === 'openDocumentManager'
			},
			pageJump(v: unknown): v is t.PageJumpActionObject {
				return i.isObj(v) && v.actionType === 'pageJump'
			},
			popUp(v: unknown): v is t.PopupActionObject {
				return i.isObj(v) && v.actionType === 'popUp'
			},
			popUpDismiss(v: unknown): v is t.PopupDismissActionObject {
				return i.isObj(v) && v.actionType === 'popUpDismiss'
			},
			refresh(v: unknown): v is t.RefreshActionObject {
				return i.isObj(v) && v.actionType === 'refresh'
			},
			removeSignature(v: unknown): v is t.RemoveSignatureActionObject {
				return i.isObj(v) && v.actionType === 'removeSignature'
			},
			saveObject(v: unknown): v is t.SaveActionObject {
				return i.isObj(v) && v.actionType === 'saveObject'
			},
			saveSignature(v: unknown): v is t.SaveSignatureActionObject {
				return i.isObj(v) && v.actionType === 'saveSignature'
			},
			updateObject(v: unknown): v is t.UpdateActionObject {
				return i.isObj(v) && v.actionType === 'updateObject'
			},
		},
		actionChain(v: unknown) {
			return (
				i.isArr(v) &&
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
			button(value: unknown): value is t.ButtonComponentObject {
				return i.isObj(value) && value.type === 'button'
			},
			canvas(value: unknown): value is t.CanvasComponentObject {
				return i.isObj(value) && value.type === 'canvas'
			},
			divider(value: unknown): value is t.DividerComponentObject {
				return i.isObj(value) && value.type === 'divider'
			},
			ecosDoc(value: unknown): value is t.EcosDocComponentObject {
				return i.isObj(value) && value.type === 'ecosDoc'
			},
			footer(value: unknown): value is t.FooterComponentObject {
				return i.isObj(value) && value.type === 'footer'
			},
			header(value: unknown): value is t.HeaderComponentObject {
				return i.isObj(value) && value.type === 'header'
			},
			image(value: unknown): value is t.ImageComponentObject {
				return i.isObj(value) && value.type === 'image'
			},
			label(value: unknown): value is t.LabelComponentObject {
				return i.isObj(value) && value.type === 'label'
			},
			list(value: unknown): value is t.ListComponentObject {
				return i.isObj(value) && value.type === 'list'
			},
			listLike(
				value: unknown,
			): value is t.ListComponentObject | t.ChatListComponentObject {
				return i.isObj(value) && ['chatList', 'list'].includes(value.type)
			},
			listItem(value: unknown): value is t.ListItemComponentObject {
				return i.isObj(value) && value.type === 'listItem'
			},
			map(value: unknown): value is t.MapComponentObject {
				return i.isObj(value) && value.type === 'map'
			},
			page(value: unknown): value is t.PageComponentObject {
				return i.isObj(value) && value.type === 'page'
			},
			plugin(value: unknown): value is t.PluginComponentObject {
				return i.isObj(value) && value.type === 'plugin'
			},
			pluginHead(value: unknown): value is t.PluginHeadComponentObject {
				return i.isObj(value) && value.type === 'pluginHead'
			},
			pluginBodyTop(value: unknown): value is t.PluginBodyTopComponentObject {
				return i.isObj(value) && value.type === 'pluginBodyTop'
			},
			pluginBodyTail(value: unknown): value is t.PluginBodyTailComponentObject {
				return i.isObj(value) && value.type === 'pluginBodyTail'
			},
			popUp(value: unknown): value is t.PopUpComponentObject {
				return i.isObj(value) && value.type === 'popUp'
			},
			register(value: unknown): value is t.RegisterComponentObject {
				return i.isObj(value) && value.type === 'register'
			},
			select(value: unknown): value is t.SelectComponentObject {
				return i.isObj(value) && value.type === 'select'
			},
			scrollView(value: unknown): value is t.ScrollViewComponentObject {
				return i.isObj(value) && value.type === 'scrollView'
			},
			textField(value: unknown): value is t.TextFieldComponentObject {
				return i.isObj(value) && value.type === 'textField'
			},
			textView(value: unknown): value is t.TextViewComponentObject {
				return i.isObj(value) && value.type === 'textView'
			},
			video(value: unknown): value is t.VideoComponentObject {
				return i.isObj(value) && value.type === 'video'
			},
			view(value: unknown): value is t.ViewComponentObject {
				return i.isObj(value) && value.type === 'view'
			},
		},
		ecosObj: {
			audio(v: unknown) {},
			doc(
				v: unknown,
			): v is t.EcosDocument<
				t.NameField<t.MimeType.Pdf | t.MimeType.Json>,
				t.DocMediaType
			> {
				return (
					i.hasNameField<t.EcosDocument>(v) &&
					(/application\//i.test(v.name?.type || '') ||
						v.subtype.mediaType === 1)
				)
			},
			font(v: unknown) {},
			image(
				v: unknown,
			): v is t.EcosDocument<t.NameField<t.MimeType.Image>, t.ImageMediaType> {
				return (
					i.hasNameField<t.EcosDocument>(v) &&
					(/image/i.test(v.name?.type || '') || v.subtype.mediaType === 4)
				)
			},
			message(v: unknown) {},
			model(v: unknown) {},
			multipart(v: unknown) {},
			other(
				v: unknown,
			): v is t.EcosDocument<t.NameField<any>, t.OtherMediaType> {
				return (
					i.hasNameField<t.EcosDocument>(v) &&
					(!/(application|audio|font|image|multipart|text|video)\//i.test(
						v.name?.type || '',
					) ||
						v.subtype.mediaType === 0)
				)
			},
			text(
				v: unknown,
			): v is t.EcosDocument<
				t.NameField<t.MimeType.Text>,
				t.TextMediaType | t.OtherMediaType
			> {
				return (
					i.hasNameField<t.EcosDocument>(v) &&
					(/text\//i.test(v.name?.type || '') ||
						v.subtype.mediaType === 8 ||
						v.subtype.mediaType === 0)
				)
			},
			video(
				v: unknown,
			): v is t.EcosDocument<t.NameField<t.MimeType.Video>, t.VideoMediaType> {
				return (
					i.hasNameField<t.EcosDocument>(v) &&
					(/video\//i.test(v.name?.type || '') || v.subtype.mediaType === 9)
				)
			},
		},
		emit(v: unknown): v is t.EmitObject {
			return i.isObj(v) && 'actions' in v
		},
		goto(v: unknown): v is t.GotoObject {
			return i.isObj(v) && 'goto' in v
		},
		if(v: unknown): v is t.IfObject {
			return i.isObj(v) && 'if' in v
		},
		mediaType: {
			audio(v: unknown): v is t.AudioMediaType {
				return v == 2
			},
			doc(v: unknown): v is t.DocMediaType {
				return v == 1
			},
			font(v: unknown): v is t.FontMediaType {
				return v == 3
			},
			image(v: unknown): v is t.ImageMediaType {
				return v == 4
			},
			message(v: unknown): v is t.MessageMediaType {
				return v == 5
			},
			model(v: unknown): v is t.ModelMediaType {
				return v == 6
			},
			multipart(v: unknown): v is t.MultipartMediaType {
				return v == 7
			},
			other(v: unknown): v is t.OtherMediaType {
				return v == 0
			},
			text(v: unknown): v is t.TextMediaType {
				return v == 8
			},
			video(v: unknown): v is t.VideoMediaType {
				return v == 9
			},
		},
		reference: i.isReference,
		textBoard(v: unknown) {
			return i.isArr(v) && v.some((o) => o.textBoardItem)
		},
		textBoardItem(v: unknown) {
			if (i.isObj(v)) return 'br' in v
			if (i.isStr(v)) return v === 'br'
			return false
		},
		url(v: unknown): v is string {
			return (
				typeof v === 'string' &&
				!v.startsWith('.') &&
				(i.isImg(v) ||
					i.isJs(v) ||
					v.endsWith('.html') ||
					i.isPdf(v) ||
					i.isVid(v))
			)
		},
		style: {
			any(v: unknown): v is StyleObject {
				return i.isObj(v) && i.hasAnyKeys(minimalStyleKeys, v)
			},
			border(v: unknown) {
				return (
					i.isObj(v) &&
					i.hasAnyKeys(['color', 'style', 'width'], v) &&
					!i.hasAnyKeys(
						i.excludeKeys(minimalStyleKeys, minimalBorderStyleKeys),
						v,
					)
				)
			},
		},
		toast(value: unknown): value is { toast: t.ToastObject } {
			return i.isObj(value) && 'message' in value
		},
	}

	const folds = {
		actionChain(
			v: unknown,
		): v is (t.ActionObject | t.EmitObjectFold | t.GotoObject)[] {
			return i.isArr(v) && v.some(composeSomes(o.action.any, o.emit, o.goto))
		},
		component: Object.assign(
			{
				any(v: unknown): v is t.AnyComponentObject {
					return (
						i.isObj(v) &&
						'type' in v &&
						componentTypes.some((t) => v.type === t)
					)
				},
			},
			Object.assign(
				{} as {
					[K in ComponentType]: <K extends t.ComponentType>(
						v: unknown,
					) => v is Omit<t.AnyComponentObject, 'type'> & { type: K }
				},
				componentTypes.reduce(
					(acc, type) =>
						Object.assign(acc, {
							[type]: (v: unknown) => i.isObj(v) && v['type'] === type,
						}),
					{},
				),
			),
		),
		emit<O extends Record<string, any>>(
			value: unknown,
		): value is t.EmitObjectFold & O {
			return i.isObj(value) && 'emit' in value
		},
		goto(value: unknown): value is { goto: t.GotoUrl | t.GotoObject } {
			return i.isObj(value) && 'goto' in value
		},
		path(value: unknown): value is { path: t.Path } {
			return i.isObj(value) && 'path' in value
		},
		style: {
			any() {},
			border() {},
		},
		textFunc(value: unknown): value is { path: t.Path } {
			return i.isObj(value) && 'text=func' in value
		},
		toast(value: unknown): value is { toast: t.ToastObject } {
			return i.isObj(value) && 'toast' in value
		},
	}

	return {
		...o,
		folds,
	}
})()
