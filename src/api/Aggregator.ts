import { AppConfig, IAppObjects, IBaseObjects, ObjectResult } from '../types'
import AppObjects from './AppObjects'
import BaseObjects, { BasesOptions } from './BaseObjects'
import Objects from './Objects'

export interface AggregateObjectsOptions {
	env: BasesOptions['env']
	endpoint: BasesOptions['endpoint']
	base?: IBaseObjects
}

class AggregateObjects extends Objects {
	#env: BasesOptions['env']
	#endpoint: BasesOptions['endpoint']
	base: IBaseObjects
	app: IAppObjects | undefined

	constructor(opts: AggregateObjectsOptions) {
		super('AggregateObjects')
		this.#env = opts.env
		this.#endpoint = opts.endpoint
		this.base = opts.base || new BaseObjects(opts)
	}

	async init(): Promise<{
		base: { [name: string]: ObjectResult['json'] }
		pages: { [pageName: string]: ObjectResult['json'] }
	}> {
		if (!this.base) {
			this.base = new BaseObjects({ env: this.#env, endpoint: this.#endpoint })
		}

		if (!this.app) {
			this.app = new AppObjects(this.base.appConfig as AppConfig)
		}

		const baseObjects = await this.base.init()
		const pageObjects = await this.app.init()

		return {
			base: baseObjects,
			pages: pageObjects,
		}
	}
}

export default AggregateObjects
