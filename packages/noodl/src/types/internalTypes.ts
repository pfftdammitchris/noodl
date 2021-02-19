import { Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { NoodlPages, NoodlRoot } from './types'

export interface InternalComposerBaseArgs {
	pages: NoodlPages
	root: NoodlRoot
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
