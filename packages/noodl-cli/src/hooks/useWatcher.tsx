import * as u from '@jsmanifest/utils'
import React from 'react'
import fs from 'fs-extra'
import path from 'path'
import chokidar from 'chokidar'
import * as co from '../utils/color.js'

export interface Hooks {
	onAdd?(args: Parameters<onAddOrChangeFn>[0]): void
	onAddDir?(args: Parameters<onAddOrChangeFn>[0]): void
	onChange?(args: Parameters<onAddOrChangeFn>[0]): void
	onError?(err: Error): void
	onReady?(
		watchedFiles: { [directory: string]: string[] } | undefined,
		watchCount: number,
	): void
	onUnlink?(filepath: string): void
	onUnlinkDir?(filepath: string): void
}

export interface onAddOrChangeFn {
	(opts: {
		isFile: boolean
		isFolder: boolean
		name: string
		path: string
		stats?: fs.Stats
	}): void
}

export type Options = Hooks & {
	watchOptions?: chokidar.WatchOptions
}

function useWatcher({ watchOptions }: Options) {
	const [watching, setWatching] = React.useState(false)
	const watcher = React.useRef<chokidar.FSWatcher | null>(null)

	const watch = React.useCallback((opts?: Hooks & { watchGlob?: string }) => {
		function onWatchEvent(fn: onAddOrChangeFn) {
			async function onEvent(filepath: string) {
				filepath = path.resolve(filepath)
				const stats = await fs.stat(filepath)
				const pathObject = path.parse(filepath)
				return fn({
					isFile: stats.isFile(),
					isFolder: stats.isDirectory(),
					name: pathObject.name,
					path: filepath,
				})
			}
			return onEvent
		}

		watcher.current = chokidar.watch(opts?.watchGlob || '*', {
			ignoreInitial: true,
			...watchOptions,
		})

		setWatching(true)

		if (opts) {
			opts.onAdd && watcher.current.on('add', onWatchEvent(opts.onAdd))
			opts.onAddDir && watcher.current.on('addDir', onWatchEvent(opts.onAddDir))
			opts.onChange && watcher.current.on('change', onWatchEvent(opts.onChange))
			opts.onError && watcher.current.on('error', opts.onError)
			opts.onUnlink && watcher.current.on('unlink', opts.onUnlink)
			opts.onUnlinkDir && watcher.current.on('unlinkDir', opts.onUnlinkDir)
			if (opts.onReady) {
				watcher.current.on('ready', () => {
					const watchedFiles = watcher.current?.getWatched()
					const watchCount = watchedFiles
						? u.reduce(
								u.values(watchedFiles),
								(count, files) => (count += files.length || 0),
								0,
						  )
						: 0
					opts.onReady?.(watchedFiles, watchCount)
				})
			}
		}
	}, [])

	return {
		tag: `[${co.cyan(`watcher`)}]`,
		watch,
		watcher,
		watching,
		setWatching,
	}
}

export default useWatcher
