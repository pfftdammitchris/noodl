import path from 'path'
import fs, { mkdirp, mkdirpSync } from 'fs-extra'
import { getFilePath } from '../src/utils/common'
import createAggregator from '../src/api/createAggregator'

const aggregator = createAggregator()

// aggregator
// .init({ loadPreloadPages: true, loadPages: true, version: 'latest' })
// .then(async ([rootConfig, appConfig]) => {
// 	console.log('Retrieved root config')
// 	console.log('Retrieved app config [cadlEndpoint]')
const writeOpts = { spaces: 2 }
const pathToJsonFolder = getFilePath('./data/objects/json/')
const pathToYmlFolder = getFilePath('./data/objects/yml/')
mkdirpSync(pathToJsonFolder)
mkdirpSync(pathToYmlFolder)
// const exts = state.ext.split('-')
// for (let index = 0; index < exts.length; index++) {
// 	const ext = exts[index] as 'json' | 'yml'
// 	console.log(ext)
// 	console.log(aggregator.get(ext))
// 	fs.writeJsonSync(
// 		ext === 'json' ? pathToJsonFolder : pathToYmlFolder,
// 		aggregator.get(ext),
// 		writeOpts,
// 	)
// }
// })
// .catch((err) => {
// 	// console.error(`[${chalk.red(err.name)}]: ${err.message}`)
// 	console.error(err)
// })
