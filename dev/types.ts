import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import flowRight from 'lodash/flowRight'
import yaml from 'yaml'
import { data as stats } from './morph'

export interface NoodlVisitFn<N extends yaml.Node = yaml.Node> {
	(args: {
		name: string
		doc: yaml.Document
		data: typeof stats
		key: Parameters<yaml.visitorFn<N>>[0]
		node: Parameters<yaml.visitorFn<N>>[1]
		path: Parameters<yaml.visitorFn<N>>[2]
		root: Map<string, yaml.Document>
	}): ReturnType<yaml.visitorFn<N>>
}
