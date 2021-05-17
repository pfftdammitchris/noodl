import * as u from '@jsmanifest/utils'
import { SetRequired } from 'type-fest'
import invariant from 'invariant'
import Scripts from '../../src/api/Scripts'
import {
	getCliConfig,
	getFilePath,
	lightGreen,
	loadFilesAsDocs,
	magenta,
} from '../../src/utils/common'
import scriptsToRegister, { ScriptId } from './scripts'
import { App } from '../../src/types'
import { Script } from '../../src/api/Scripts/types'
import * as t from './types'

async function aggregate() {
	const settings = getCliConfig().scripts.aggregator as SetRequired<
		App.CliConfigObject['scripts']['aggregator'],
		keyof App.CliConfigObject['scripts']['aggregator']
	>

	invariant(
		!!settings.dataFiles,
		u.red(`Missing path to ${magenta(`dataFiles`)}`),
	)

	invariant(!!settings.outFile, u.red(`Missing ${magenta(`outFile`)} path`))

	const dataDir = settings.dataFiles // loadFilesAsDocs uses path.resolve already
	const outFile = getFilePath(settings.outFile)
	const registeredScripts = [] as [
		ScriptId,
		Script.Register<t.AggregatorStore>,
	][]

	for (const [scriptKey, registerScript] of u.entries(scriptsToRegister)) {
		if (settings.use.includes(scriptKey)) {
			registeredScripts.push([scriptKey, registerScript])
		}
	}

	invariant(
		registeredScripts.length > 0,
		u.red(`At least one script is required to run`),
	)

	const scripts = new Scripts<t.AggregatorStore>({
		dataFilePath: outFile,
		docs: loadFilesAsDocs({
			as: 'metadataDocs',
			dir: dataDir,
			includeExt: false,
			recursive: false,
		}),
	})

	scripts
		.use({
			script: u.values(scriptsToRegister),
			onEnd: () => u.log(`${u.withTag(`End`, lightGreen)} script`),
		})
		.run()
}

export default aggregate
