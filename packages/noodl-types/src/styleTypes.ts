export interface StyleObject {
	align?: StyleAlign
	axis?: StyleAxis // TODO - check if handling
	activeColor?: string
	background?: string // TODO - check if handling
	backgroundColor?: string // TODO - check if handling
	border?: StyleBorderObject
	borderColor?: string // TODO - check if handling
	borderRadius?: string // TODO - check if handling
	borderWidth?: string // TODO - check if handling
	boxShadow?: string // TODO - check if handling
	boxSizing?: string // TODO - check if handling
	color?: string
	contentSize?: {
		// TODO - check if handling
		width?: string
		height?: string
	}
	display?: string // TODO - check if handling
	float?: boolean
	flex?: string
	flexFlow?: any
	fontColor?: string // TODO - check if handling
	fontSize?: string
	fontFamily?: string
	fontStyle?: 'bold' | string
	fontWeight?: string // TODO - check if handling
	height?: string
	isHidden?: boolean
	justifyContent?: string
	left?: string
	letterSpacing?: string
	lineHeight?: string
	marginLeft?: string
	marginTop?: string
	outline?: string
	padding?: string // TODO - check if handling
	paddingTop?: string // TODO - check if handling
	paddingLeft?: string // TODO - check if handling
	paddingRight?: string // TODO - check if handling
	paddingBottom?: string // TODO - check if handling
	position?: string
	required?: string
	shadow?: string // ex: "false"
	textAlign?: StyleTextAlign
	textColor?: string
	textDecoration?: string
	textIndent?: string // TODO - check if handling
	top?: string
	width?: string
	zIndex?: number // TODO - check if handling
	[key: string]: any
}

export type StyleAlign = 'centerX' | 'centerY'

export type StyleAxis = 'horizontal' | 'vertical'

export interface StyleBorderObject {
	style?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | 1 | 2 | 3 | 4 | 5 | 6 | 7
	width?: string | number
	color?: string | number
	line?: string // ex: "solid"
	[key: string]: any
}

export type StyleTextAlign =
	| 'left'
	| 'center'
	| 'right'
	| StyleAlign
	| StyleTextAlignObject

export interface StyleTextAlignObject {
	x?: 'left' | 'center' | 'right' | 'centerX'
	y?: 'left' | 'center' | 'right' | 'centerY'
	[key: string]: any
}
