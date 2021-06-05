import { LiteralUnion } from 'type-fest'
import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import store from '../store'
import { Cli } from '../cli'
import * as com from '../utils/common'
import * as co from '../utils/color'
import * as c from '../constants'
import * as t from '../types'

export interface Options {
	cli: Cli
	onInit?(): void
}

function useConfiguration({ cli, onInit }: Options) {
	const clear = React.useCallback(store.clear, [])
	const getAll = React.useCallback(() => store.all, [])

	/** Returns relative path */
	const getDefaultGenerateDir = React.useCallback(
		() => com.getAbsFilePath(c.DEFAULT_GENERATE_DIR),
		[],
	)

	/** Returns  */
	const getPathToGenerateDir = React.useCallback(() => {
		// Temp. backwards compatibility
		const ymlCfg = fs.readFileSync(com.getAbsFilePath('noodl.yml'), 'utf8')
		const docCfg = yaml.parseDocument(ymlCfg)
		if (docCfg.hasIn(['objects', 'yml', 'dir'])) {
			const dir = docCfg.getIn(['objects', 'yml', 'dir'])
			if (yaml.isScalar(dir) && dir.value)
				return com.getAbsFilePath(dir.value as string)
			else if (yaml.isSeq(dir))
				return com.getAbsFilePath(dir.toJSON()[0] as string)
		}
		return store.get(c.GENERATE_DIR_KEY) || ''
	}, [])

	const setPathToGenerateDir = React.useCallback(
		(
			path: LiteralUnion<'default', string>,
			opts?: {
				onCreated?(path: string): void
				onError?(opts: { error: Error & { code: string }; path: string }): void
			},
		) => {
			store.set(
				c.GENERATE_DIR_KEY,
				path === 'default' ? getDefaultGenerateDir() : com.getAbsFilePath(path),
			)
			const pathToGenerateDir = getPathToGenerateDir()
			refreshLastUpdatedTimestamp()
			if (!fs.pathExistsSync(pathToGenerateDir)) {
				try {
					fs.ensureDirSync(pathToGenerateDir)
					opts?.onCreated?.(pathToGenerateDir)
				} catch (error) {
					opts?.onError?.({ error, path: pathToGenerateDir })
				}
			}
			return pathToGenerateDir
		},
		[],
	)

	const isFresh = React.useCallback(() => !store.has('timestamp'), [])

	const initTimestamp = React.useCallback(() => {
		store.set('timestamp', new Date().toISOString())
		return store.get('timestamp')
	}, [])

	const refreshLastUpdatedTimestamp = React.useCallback(() => {
		store.set('lastUpdated', new Date().toISOString())
		return store.get('lastUpdated')
	}, [])

	React.useEffect(() => {
		//
	}, [])

	return {
		clear,
		getAll,
		getDefaultGenerateDir,
		getPathToGenerateDir,
		initTimestamp,
		isFresh,
		refreshLastUpdatedTimestamp,
		setPathToGenerateDir,
	}
}

export default useConfiguration
