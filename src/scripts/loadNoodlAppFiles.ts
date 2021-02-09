import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import { AppConfig, RootConfig } from 'types'
import createAggregator from '../api/createAggregator'
import { DEFAULT_CONFIG_HOSTNAME } from '../constants'
import * as u from '../utils/common'

const log = console.log

export interface MetadataObject {
	assetType: 'html' | 'image' | 'js' | 'pdf' | 'video' | 'yml'
	ext?: string
	filepath?: any
	pathname: string
}

export interface Options {
	aggregator?: ReturnType<typeof createAggregator>
	config: string
	serverDir: string
}

async function loadNoodlAppFiles({
	aggregator: aggregatorProp,
	config = 'aitmed',
	serverDir,
}: Options) {}

export default loadNoodlAppFiles

loadNoodlAppFiles({
	config: 'meet2',
	serverDir: 'output/server',
})
