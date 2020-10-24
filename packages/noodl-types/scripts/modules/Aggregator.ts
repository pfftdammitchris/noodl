import _ from 'lodash'
import BaseSetup from './BaseSetup'
import AppSetup from './AppSetup'

export interface AggregatorOptions {
  endpoint?: string
  json?: boolean
  yml?: boolean
}

class Aggregator {
  #baseSetup: BaseSetup
  #appSetup: AppSetup
  items: { [name: string]: any } = {}
  endpoint: AggregatorOptions['endpoint']

  constructor({ endpoint, ...options }: AggregatorOptions) {
    this.#baseSetup = new BaseSetup({ endpoint, ...options })
    this.#appSetup = new AppSetup(options)
    this.endpoint = endpoint
  }

  async load({
    includeBasePages = true,
    includePages = true,
  }: { includeBasePages?: boolean; includePages?: boolean } = {}) {
    const {
      rootConfig: { json: rootConfig },
      noodlConfig: { json: noodlConfig },
    } = await this.#baseSetup.load({ includeBasePages })
    if (includePages) {
      this.#appSetup.baseUrl = this.#baseSetup.baseUrl
      this.#appSetup.endpoint = this.#baseSetup.baseUrl + rootConfig.cadlMain
      await this.#appSetup.load(noodlConfig.page)
    }
    _.assign(this.items, this.#baseSetup.items, this.#appSetup.items)
    return this.items
  }

  get base() {
    return this.#baseSetup
  }

  get app() {
    return this.#appSetup
  }

  get length() {
    return _.keys(this.items).length
  }

  objects({
    basePages = true,
    pages = true,
  }: { basePages?: boolean; pages?: boolean } = {}) {
    const destruct = (obj) =>
      _.reduce(
        _.entries(obj),
        (acc, [key, value]) => {
          acc[key] = value?.json
          return acc
        },
        {} as any,
      )
    return _.assign(
      {},
      basePages ? destruct(this.#baseSetup.items) : undefined,
      pages ? destruct(this.#appSetup.items) : undefined,
    )
  }
}

export default Aggregator
