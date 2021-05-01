export interface EcosDocument<N extends NameField.Base = NameField.Base> {
	id: string
	ctime: number
	mtime: number
	atime: number
	atimes: number
	tage: number
	type: number
	name: N | undefined | null
	deat: Deat
	size: number
	fid: string
	eid: string
	bsig: string
	esig: string
	created_at: number
	modified_at: number
	subtype: SubtypeObject
}

export type Deat = DeatObject | number

export interface DeatObject {
	url: string
	sig: string
	exptime: string
}

export namespace NameField {
	export interface Base<Type extends string = string> {
		tags?: string[]
		type: Type
		user?: string
	}

	export interface DocBase<Type extends string = string> extends Base<Type> {
		data: string
	}

	export interface MediaBase<Type extends string = string> extends Base<Type> {
		data: string
	}

	export interface TextBase<Type extends string = string> extends Base<Type> {
		title?: string
		content?: string
	}

	export namespace Doc {
		export type Epub = DocBase<'application/epub+zip'>
		// prettier-ignore
		export type Excel = DocBase<`application/${'vnd.ms-excel' | 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'}`>
		export type Json = DocBase<'application/json'>
		export type Pdf = DocBase<'application/pdf'>
		// prettier-ignore
		export type PowerPoint = DocBase<`application/${'vnd.ms-powerpoint' | 'vnd.openxmlformats-officedocument.presentationml.presentatio'}`>
		// prettier-ignore
		export type Zipped = DocBase<`application/${'vnd.rar' | 'x-7z-compressed' | 'x-tar' | 'zip'}`>
		// prettier-ignore
		export type Word = DocBase<`application/${'msword' | 'vnd.openxmlformats-officedocument.wordprocessingml.document'}`>
		export type RichTxt = DocBase<'application/rtf'>
	}

	export namespace Media {
		// prettier-ignore
		export type Audio = MediaBase<`audio/${'3gp' | 'flac' | 'm4a' | 'mp3' | 'ogg' | 'wav' | 'wma' | 'webm'}`>
		// prettier-ignore
		export type Image = MediaBase<`image/${'ai' | 'bmp' | 'eps' | 'gif' | 'jpg' | 'jpeg' | 'png' | 'psd' | 'svg' | 'tiff' | 'webp'}`>
		// prettier-ignore
		export type Video = MediaBase<`video/${'avi' | 'flv' | 'mkv' | 'mov' | 'mpg' | 'mp4' | 'ogg' | 'webm' | 'wmv'}`>
	}

	export namespace Text {
		export type Csv = TextBase<`text/csv`>
		export type Html = TextBase<`text/html`>
		export type JavaScript = TextBase<`text/javascript`>
		export type Plain = TextBase<`text/plain`>
		export type Markdown = TextBase<`text/markdown`>
		export type Xml = TextBase<`text/xml`>
	}
}

export interface SubtypeObject {
	isOnServer: null | boolean
	isZipped: null | boolean
	isBinary: null | boolean
	isEncrypted: null | boolean
	isEditable: null | boolean
	applicationDataType: null | number
	mediaType: null | MediaType
	size: null | number
}

export type MediaType =
	| AudioMediaType
	| DocMediaType
	| FontMediaType
	| ImageMediaType
	| MessageMediaType
	| ModelMediaType
	| MultipartMediaType
	| OtherMediaType
	| TextMediaType
	| VideoMediaType

export type OtherMediaType = 0
export type DocMediaType = 1
export type AudioMediaType = 2
export type FontMediaType = 3
export type ImageMediaType = 4
export type MessageMediaType = 5
export type ModelMediaType = 6
export type MultipartMediaType = 7
export type TextMediaType = 8
export type VideoMediaType = 9
