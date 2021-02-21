import { Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import Root from '../Root'
import { Pages } from './types'

export interface InternalComposerBaseArgs {
	pages: Pages
	root: Root
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
