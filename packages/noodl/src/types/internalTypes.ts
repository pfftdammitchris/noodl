import type { Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml'
import type { Pages } from './types'
import type Root from '../Root'

export interface InternalComposerBaseArgs {
	pages: Pages
	root: Root
}

export type YAMLNode = Scalar | Pair | YAMLMap | YAMLSeq
