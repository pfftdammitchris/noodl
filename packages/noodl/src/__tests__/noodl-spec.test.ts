/**
 * This file contains unit tests that ensures nodes are able to resolve
 * values from the AST corresponding to the NOODL spec
 */
import yaml from 'yaml'
import sinon from 'sinon'
import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import { noodl } from '../utils/test-utils'
import { Pair, Scalar, YAMLMap } from 'yaml/types'
import NoodlPage from '../Page'
import NoodlRoot from '../Root'
import NoodlUtils from '../Utils'
import Transformer, { _noodlSpecTransformers } from '../Transformer'
import * as T from '../types'
import * as u from '../utils/internal'

let transformer: Transformer

beforeEach(() => {
	transformer = new Transformer({ pages: noodl.pages, root: noodl.root })
	Object.values(_noodlSpecTransformers).forEach(
		transformer.createTransform.bind(transformer),
	)
})

describe(coolGold('NOODL Specification'), () => {
	describe(italic('References'), () => {
		//
	})
})
