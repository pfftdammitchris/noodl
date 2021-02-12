import axios from 'axios'
import chalk from 'chalk'
import curry from 'lodash/curry'
import ECOS from '@aitmed/ecos-lvl2-sdk'
import get from 'lodash/get'
import fs from 'fs-extra'
import path from 'path'
import produce from 'immer'
import yaml, { createNode } from 'yaml'
import { findPair } from 'yaml/util'
import { Scalar, Pair, YAMLMap, YAMLSeq } from 'yaml/types'
import { Identify } from '../packages/noodl-types/src/Identify'
import createAggregator from '../src/api/createAggregator'
import { EcosGRPC, RootConfig, YAMLNode } from '../src/types'
import { getFilepath } from '../src/utils/common'
import { PlainObject } from 'noodl-utils/dist/types'

const DEFAULT_OPTIONS = {
	config: 'aitmed.yml',
	env: 'test',
	host: 'public.aitmed.com',
	version: 'latest',
} as const

const NOODL = (function () {
	let aggregator: ReturnType<typeof createAggregator> = createAggregator({
		config: DEFAULT_OPTIONS.config,
		host: DEFAULT_OPTIONS.host,
		version: DEFAULT_OPTIONS.version,
	})
	let ecos: ECOS
	let env: 'test' | 'stable'
	let grpc: EcosGRPC
	let hostname = 'hostname'
	let name = 'aitmed'

	async function _loadGrpc(apiHost: string) {
		const EcosV1Beta1 = (await import('@aitmed/protorepo')).default
		grpc = new EcosV1Beta1(`https://${apiHost}`)
		return grpc
	}

	const o = {
		get name() {
			return name
		},
		set name(value: string) {
			name = value
		},
		get config() {
			return aggregator.get('config')
		},
		set config(cfg: string) {
			aggregator.config = cfg
		},
		get host() {
			return aggregator.get('host')
		},
		set host(host: string) {
			aggregator.setHost(host)
		},
		get hostname() {
			return hostname
		},
		set hostname(value: string) {
			hostname = value
		},
		async load({ env = 'test' }) {
			ecos = new ECOS({
				apiVersion: env,
				configUrl: `https://${o.host}/config/${o.config}`,
				env: 'development',
			})

			const [rootConfig, appConfig] = await aggregator.init({
				loadPages: true,
				version: 'latest',
			})

			const { apiHost, apiPort, webApiHost } = rootConfig

			ecos.apiHost = webApiHost !== 'apiHost' ? webApiHost : apiHost
			aggregator.port = Number(apiPort)
			o.name = getAppName()

			grpc = await _loadGrpc(apiHost)

			return {
				aggregator,
				ecos,
				grpc,
				rootConfig,
				appConfig,
			}
		},
	}

	return o
})()

function getAppName() {
	if (
		typeof window !== 'undefined' &&
		window.location.hostname !== 'localhost' &&
		window.location.hostname !== '127.0.0.1'
	) {
		const splits = window.location.hostname.split('.')
		if (splits[1] === 'aitmed') {
			return splits[0]
		} else {
			return splits.slice(0, splits.length - 1).join('.')
		}
	}
	return 'aitmed'
}

interface ParseContext {
	root?: PlainObject
}

const parser = (function () {
	let docs = [] as yaml.Document[]
	const symbols = ['.', '..', '=', '~'] as const

	function _parseDotRefs(obj: any) {
		const symbs = ['.', '..']
	}

	function onKeyValue(cb: (key: string, value: any) => void, obj: PlainObject) {
		if (obj && typeof obj === 'object') {
			Object.entries(obj).forEach((keyValue) => {
				cb(...keyValue)
				onKeyValue(cb, keyValue[1])
			})
		} else if (Array.isArray(obj)) {
			obj.forEach((o) => onKeyValue(cb, o))
		}
	}

	function onReference(
		cb: (type: 'key' | 'value', value: any) => void,
		obj: PlainObject,
	) {
		onKeyValue((key, value) => {
			Identify.reference(key) && cb('key', key)
			Identify.reference(value) && cb('value', value)
		}, obj)
	}

	const o = {
		parse: curry((ctx: ParseContext, page: string) => {
			onReference((type, value) => {
				let keypath = ''
				let dataObj: any
				let result: any

				console.log({ type, value, baeHeader: ctx.root })
				// Local root
				if (value.startsWith('..')) {
					keypath = value.substring(2)
					dataObj = ctx.root[page]
				}
				// Root
				else if (value.startsWith('.')) {
					keypath = value.substring(1)
					dataObj = ctx.root
				}

				result = get(dataObj, keypath)

				if (result) {
					console.log(
						`[${chalk.magenta(type)}] ${chalk.yellow('REFERENCE')}`,
						result,
					)
				}
			}, ctx.root[page])
		}),
	}

	return o
})()

// const file = fs.readFileSync(
// 	getFilepath('data/generated/yml/ContactsList.yml'),
// 	'utf8',
// )

// const parse = parser.parse({ root: yaml.parse(file) })
// parse('ContactsList')

NOODL.load({ env: 'test' })
	.then(({ aggregator, rootConfig, appConfig, ecos, grpc }) => {
		const root = aggregator.get('json')
		const parse = parser.parse({ root })
		parse('NursingHome')
	})
	.catch((err) => {
		console.error(err)
	})
