import React from 'react'
import chalk from 'chalk'
import path from 'path'
import download from 'download'
import produce, { Draft } from 'immer'
import globby from 'globby'
import fs from 'fs-extra'
import uniq from 'lodash/uniq'
import { WritableDraft } from 'immer/dist/internal'
import { Box, Static } from 'ink'
import {
	isImg,
	isJs,
	isPdf,
	isVid,
	loadFiles,
	magenta,
	highlight,
	red,
	getFilePath,
} from '../utils/common'
import { serverScript as e } from '../constants'
import useCtx from '../useCtx'

function StartServerLoadFiles({ config = '' }: { config: string | undefined }) {
	const { aggregator, setCaption, setErrorCaption, server } = useCtx()

	React.useEffect(() => {
		async function start() {
			try {
				// const files = loadFiles({
				// 	dir: getFilePath(server.dir),
				// 	ext: 'yml',
				// 	onFile({ filename }) {
				// 		setCaption(`Loaded ${filename}`)
				// 	},
				// })
				let filepaths = await globby(path.join(server.dir, '**/*'))
				let configFilePath = filepaths.find((f) => f.includes(config))
				let configFile
				if (configFilePath) {
					configFile = await fs.readFile(configFilePath, 'utf8')
				}
				if (!configFile) {
					configFile = aggregator.get(config)?.yml || ''
				}
				if (!configFile) {
					if (!aggregator.initialized) {
						await aggregator.init({ loadPages: true })
					}
					configFile = aggregator.get('yml')[config]
					console.log(configFile)
				}
				if (!configFile) {
					throw new Error(
						`Could not find the config file ${magenta(
							config,
						)} locally or remotely through a URL`,
					)
				}
			} catch (error) {
				setErrorCaption(error)
			}
		}

		start()
			.then(() => {
				//
			})
			.catch(setErrorCaption)
	}, [])

	return <Box flexDirection="column">{null}</Box>
}

export default StartServerLoadFiles
