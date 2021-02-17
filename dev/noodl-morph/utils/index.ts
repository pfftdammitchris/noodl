export * from './doc'
export * from './scalar'
export * from './map'
export * from './seq'

export {
	hasAllKeys,
	hasAnyKeys,
	hasKey,
	hasKeyEqualTo,
	isScalar,
	isPair,
	isYAMLMap as isMap,
	isYAMLSeq as isSeq,
} from '../../../src/utils/doc'
