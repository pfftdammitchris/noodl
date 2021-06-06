import * as u from '@jsmanifest/utils'
import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import * as com from '../utils/common'
import * as co from '../utils/color'
import * as t from '../types'

export interface onAddOrChangeFn {
	(opts: {
		isFile: boolean
		isFolder: boolean
		name: string
		path: string
		stats?: fs.Stats
	}): void
}

export interface Options {
	watchGlob?: string
	watchOptions?: chokidar.WatchOptions
	onAdd?(args: Parameters<onAddOrChangeFn>[0]): void
	onAddDir?(args: Parameters<onAddOrChangeFn>[0]): void
	onChange?(args: Parameters<onAddOrChangeFn>[0]): void
	onError?(err: Error): void
	onReady?(): void
	onUnlink?(filepath: string): void
	onUnlinkDir?(filepath: string): void
}

function useWatcher({
	watchGlob = '*',
	watchOptions,
	onAdd,
	onAddDir,
	onChange,
	onError,
	onReady,
	onUnlink,
	onUnlinkDir,
}: Options) {
	const watcher = React.useRef<chokidar.FSWatcher | null>(null)

	const watch = React.useCallback(() => {
		const tag = `[${co.cyan(`watcher`)}]`

		const getFileName = (path: string) => {
			path.includes('/') && (path = path.substring(path.lastIndexOf('/') + 1))
			path.endsWith('.yml') &&
				(path = path.substring(0, path.lastIndexOf('.yml')))
			return path
		}

		function onWatchEvent(fn: onAddOrChangeFn) {
			async function onEvent(filepath: string) {
				filepath = path.resolve(filepath)
				const stats = await fs.stat(filepath)
				return fn({
					isFile: stats.isFile(),
					isFolder: stats.isDirectory(),
					name: getFileName(filepath),
					path: filepath,
				})
			}
			return onEvent
		}

		watcher.current = chokidar.watch(watchGlob, {
			ignoreInitial: true,
			...watchOptions,
		})

		onAdd && watcher.current.on('add', onWatchEvent(onAdd))
		onAddDir && watcher.current.on('addDir', onWatchEvent(onAddDir))
		onChange && watcher.current.on('change', onWatchEvent(onChange))
		onError && watcher.current.on('error', onError)
		onReady && watcher.current.on('ready', onReady)
		onUnlink && watcher.current.on('unlink', onUnlink)
		onUnlinkDir && watcher.current.on('unlinkDir', onUnlinkDir)
	}, [])

	return {
		tag: `[${co.cyan(`watcher`)}]`,
		watch,
		watcher,
	}
}

export default useWatcher