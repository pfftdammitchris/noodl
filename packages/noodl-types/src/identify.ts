import { componentTypes } from './_internal/constants'
import { ComponentType } from './constantTypes'
import * as t from '.'
import * as i from './_internal'

type PlainObject<O extends Record<string, any> = Record<string, any>> = Record<
	string,
	any
> &
	O

function identifyObj<
	O extends PlainObject = PlainObject,
	F extends (value: PlainObject) => any = (value: PlainObject) => any,
>(fn: F) {
	return function (v: O): v is O {
		if (i.isObj(v)) return fn(v)
		return false
	}
}

export const Identify = (function () {
	const composeSomes =
		(...fns: any[]) =>
		(arg: any) =>
			fns.some((fn) => fn(arg))

	const o = {
		rootConfig: identifyObj<t.RootConfig>((v) =>
			['apiHost', 'apiPort'].every((key) => key in v),
		),
		appConfig: identifyObj<t.AppConfig>((v) =>
			['startPage'].every((key) => key in v),
		),
		action: {
			any: identifyObj<t.ActionObject>((v) => 'actionType' in v),
			builtIn: identifyObj<t.BuiltInActionObject>(
				(v) => 'funcName' in v || v.actionType === 'builtIn',
			),
			evalObject: identifyObj<t.EvalActionObject>(
				(v) => v.actionType === 'evalObject',
			),
			openCamera: identifyObj<t.OpenCameraActionObject>(
				(v) => v.actionType === 'openCamera',
			),
			openPhotoLibrary: identifyObj<t.OpenPhotoLibraryActionObject>(
				(v) => v.actionType === 'openPhotoLibrary',
			),
			openDocumentManager: identifyObj<t.OpenDocumentManagerActionObject>(
				(v) => v.actionType === 'openDocumentManager',
			),
			pageJump: identifyObj<t.PageJumpActionObject>(
				(v) => v.actionType === 'pageJump',
			),
			popUp: identifyObj<t.PopupActionObject>((v) => v.actionType === 'popUp'),
			popUpDismiss: identifyObj<t.PopupDismissActionObject>(
				(v) => v.actionType === 'popUpDismiss',
			),
			refresh: identifyObj<t.RefreshActionObject>(
				(v) => v.actionType === 'refresh',
			),
			removeSignature: identifyObj<t.RemoveSignatureActionObject>(
				(v) => v.actionType === 'removeSignature',
			),
			saveObject: identifyObj<t.SaveActionObject>(
				(v) => v.actionType === 'saveObject',
			),
			saveSignature: identifyObj<t.SaveSignatureActionObject>(
				(v) => v.actionType === 'saveSignature',
			),
			updateObject: identifyObj<t.UpdateActionObject>(
				(v) => v.actionType === 'updateObject',
			),
		},
		actionChain: identifyObj<any[]>(
			(v) =>
				i.isArr(v) && [o.action.any, o.emit, o.goto].some((fn) => v.some(fn)),
		),
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
			button: identifyObj<t.ButtonComponentObject>((v) => v.type === 'button'),
			canvas: identifyObj<t.CanvasComponentObject>((v) => v.type === 'canvas'),
			divider: identifyObj<t.DividerComponentObject>(
				(v) => v.type === 'divider',
			),
			ecosDoc: identifyObj<t.EcosDocComponentObject>(
				(v) => v.type === 'ecosDoc',
			),
			footer: identifyObj<t.FooterComponentObject>((v) => v.type === 'footer'),
			header: identifyObj<t.HeaderComponentObject>((v) => v.type === 'header'),
			image: identifyObj<t.ImageComponentObject>((v) => v.type === 'image'),
			label: identifyObj<t.LabelComponentObject>((v) => v.type === 'label'),
			list: identifyObj<t.ListComponentObject>((v) => v.type === 'list'),
			listLike: identifyObj<t.ListComponentObject | t.ChatListComponentObject>(
				(v) => ['chatList', 'list'].includes(v.type),
			),
			listItem: identifyObj<t.ListItemComponentObject>(
				(v) => v.type === 'listItem',
			),
			map: identifyObj<t.MapComponentObject>((v) => v.type === 'map'),
			page: identifyObj<t.PageComponentObject>((v) => v.type === 'page'),
			plugin: identifyObj<t.PluginComponentObject>((v) => v.type === 'plugin'),
			pluginHead: identifyObj<t.PluginHeadComponentObject>(
				(v) => v.type === 'pluginHead',
			),
			pluginBodyTop: identifyObj<t.PluginBodyTopComponentObject>(
				(v) => v.type === 'pluginBodyTop',
			),
			pluginBodyTail: identifyObj<t.PluginBodyTailComponentObject>(
				(v) => v.type === 'pluginBodyTail',
			),
			popUp: identifyObj<t.PopUpComponentObject>((v) => v.type === 'popUp'),
			register: identifyObj<t.RegisterComponentObject>(
				(v) => v.type === 'register',
			),
			select: identifyObj<t.SelectComponentObject>((v) => v.type === 'select'),
			scrollView: identifyObj<t.ScrollViewComponentObject>(
				(v) => v.type === 'scrollView',
			),
			textField: identifyObj<t.TextFieldComponentObject>(
				(v) => v.type === 'textField',
			),
			textView: identifyObj<t.TextViewComponentObject>(
				(v) => v.type === 'textView',
			),
			video: identifyObj<t.VideoComponentObject>((v) => v.type === 'video'),
			view: identifyObj<t.ViewComponentObject>((v) => v.type === 'view'),
		},
		ecosObj: {
			audio(v: unknown) {},
			doc: identifyObj<
				t.EcosDocument<
					t.NameField<t.MimeType.Pdf | t.MimeType.Json>,
					t.DocMediaType
				>
			>(
				(v) =>
					i.hasNameField<t.EcosDocument>(v) &&
					(/application\//i.test(v.name?.type || '') ||
						v.subtype.mediaType === 1),
			),
			font(v: unknown) {},
			image: identifyObj<
				t.EcosDocument<t.NameField<t.MimeType.Image>, t.ImageMediaType>
			>(
				(v) =>
					i.hasNameField<t.EcosDocument>(v) &&
					(/image/i.test(v.name?.type || '') || v.subtype.mediaType === 4),
			),
			message(v: unknown) {},
			model(v: unknown) {},
			multipart(v: unknown) {},
			other: identifyObj<t.EcosDocument<t.NameField<any>, t.OtherMediaType>>(
				(v) =>
					i.hasNameField<t.EcosDocument>(v) &&
					(!/(application|audio|font|image|multipart|text|video)\//i.test(
						v.name?.type || '',
					) ||
						v.subtype.mediaType === 0),
			),
			text: identifyObj<
				t.EcosDocument<
					t.NameField<t.MimeType.Text>,
					t.TextMediaType | t.OtherMediaType
				>
			>(
				(v) =>
					i.hasNameField<t.EcosDocument>(v) &&
					(/text\//i.test(v.name?.type || '') ||
						v.subtype.mediaType === 8 ||
						v.subtype.mediaType === 0),
			),

			video: identifyObj<
				t.EcosDocument<t.NameField<t.MimeType.Video>, t.VideoMediaType>
			>(
				(v) =>
					i.hasNameField<t.EcosDocument>(v) &&
					(/video\//i.test(v.name?.type || '') || v.subtype.mediaType === 9),
			),
		},
		emit: identifyObj<t.EmitObject>((v) => 'actions' in v),
		goto: identifyObj<t.GotoObject>((v) => 'goto' in v),
		if: identifyObj<t.IfObject>((v) => 'if' in v),
		mediaType: {
			audio: (v: unknown): v is t.AudioMediaType => v == 2,
			doc: (v: unknown): v is t.DocMediaType => v == 1,
			font: (v: unknown): v is t.FontMediaType => v == 3,
			image: (v: unknown): v is t.ImageMediaType => v == 4,
			message: (v: unknown): v is t.MessageMediaType => v == 5,
			model: (v: unknown): v is t.ModelMediaType => v == 6,
			multipart: (v: unknown): v is t.MultipartMediaType => v == 7,
			other: (v: unknown): v is t.OtherMediaType => v == 0,
			text: (v: unknown): v is t.TextMediaType => v == 8,
			video: (v: unknown): v is t.VideoMediaType => v == 9,
		},
		reference: i.isReference,
		textBoard: (v: unknown) => i.isArr(v) && v.some((o) => o.textBoardItem),
		textBoardItem<O extends { br: any } | 'br'>(v: O) {
			if (i.isObj(v)) return 'br' in v
			if (i.isStr(v)) return v === 'br'
			return false
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
				any<O extends PlainObject>(v: unknown): v is t.ActionObject & O {
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
					) => v is Omit<t.ActionObject, 'type'> & { type: K }
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
		emit<O extends PlainObject>(value: unknown): value is t.EmitObjectFold & O {
			return i.isObj(value) && 'emit' in value
		},
		goto<O extends PlainObject>(
			value: unknown,
		): value is { goto: t.GotoUrl | t.GotoObject } & O {
			return i.isObj(value) && 'goto' in value
		},
		if(value: unknown): value is t.IfObject {
			return i.isObj(value) && 'if' in value
		},
		path(value: unknown): value is { path: t.Path } & Record<string, any> {
			return i.isObj(value) && 'path' in value
		},
		style: {
			any() {},
			border() {},
		},
		textFunc<O extends PlainObject>(
			value: unknown,
		): value is { path: t.Path } & O {
			return i.isObj(value) && 'text=func' in value
		},
		toast<O extends PlainObject>(
			value: unknown,
		): value is { toast: t.ToastObject } & O {
			return i.isObj(value) && 'toast' in value
		},
	}

	return {
		...o,
		folds,
	}
})()
