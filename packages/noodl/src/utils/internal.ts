import { Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import { NoodlPage } from '../types'

export interface PlainObject {
	[key: string]: any
}

export const assign = (v: any, ...rest: (PlainObject | undefined)[]) =>
	v && isObj(v) && Object.assign(v, ...rest)
export const isArr = (v: any): v is any[] => Array.isArray(v)
export const isBool = (v: any): v is boolean => typeof v === 'boolean'
export const isNum = (v: any): v is number => typeof v === 'number'
export const isFnc = (v: any): v is Function => typeof v === 'function'
export const isStr = (v: any): v is string => typeof v === 'string'
export const isNull = (v: any): v is null => v === null
export const isUnd = (v: any): v is undefined => v === undefined
export const isNil = (v: any): v is null | undefined => isNull(v) && isUnd(v)
export const isObj = <V extends Record<string, any>>(v: any): v is V =>
	!!v && !isArr(v) && typeof v === 'object'
export const isNode = (v: any) => !!(v && v instanceof Node)
export const isPage = (v: any) => !!(v && v instanceof NoodlPage)
export const isMap = (v: any): v is YAMLMap => v instanceof YAMLMap
export const isPair = (v: any): v is Pair => v instanceof Pair
export const isScalar = (v: any): v is Scalar => v instanceof Scalar
export const isSeq = (v: any): v is YAMLSeq => v instanceof YAMLSeq
