export const isArr = (v: any): v is any[] => Array.isArray(v)
export const isBool = (v: any): v is boolean => typeof v === 'boolean'
export const isObj = (v: any): v is object => !!v && typeof v === 'object'
export const isNum = (v: any): v is number => typeof v === 'number'
export const isStr = (v: any): v is string => typeof v === 'string'
export const isUnd = (v: any): v is undefined => typeof v === 'undefined'