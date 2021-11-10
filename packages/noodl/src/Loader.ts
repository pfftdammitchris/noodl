import winston from 'winston'
import * as u from '@jsmanifest/utils'
import type { OrArray } from '@jsmanifest/typefest'
import type { LinkStructure } from 'noodl'
import { getLinkStructure, stringifyDoc } from 'noodl'
import chunk from 'lodash/chunk.js'
import flatten from 'lodash/flatten.js'
import path from 'path'
import * as fs from 'fs-extra'
import type { DeviceType, Env } from 'noodl-types'
import * as nu from 'noodl-utils'
import invariant from 'invariant'
import axios from 'axios'
import chalk from 'chalk'
import yaml from 'yaml'
import promiseAllSafely from './utils/promiseAllSafely.js'
import shallowMerge from './utils/shallowMerge.js'
import * as c from './constants.js'
import * as t from './types.js'

const { existsSync, readFile } = fs
const { createNoodlPlaceholderReplacer, hasNoodlPlaceholder, isValidAsset } = nu

class NoodlLoader {
	//
}

export default NoodlLoader
