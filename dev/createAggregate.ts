import * as u from '@jsmanifest/utils'
import { Identify } from 'noodl-types'
import flowRight from 'lodash/flowRight'
import Aggregator from 'noodl-aggregator'
import yaml from 'yaml'
import {
	isReference,
	isRootReference,
	isLocalReference,
	isBoolean,
	isNumber,
	isString,
} from 'noodl'
import { data as stats } from './morph'
import visit from './visit'
import * as t from './types'

export interface CreateAggregateOptions {
	//
}

const createAggregate = function _createAggregate(
	root: Aggregator['root'],
	options: CreateAggregateOptions,
) {}

export default createAggregate
