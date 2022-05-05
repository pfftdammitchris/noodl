import type { PluginObject } from './types'

class Store {
  #data: Record<string, any> = {}
  #plugins = new Map<string, PluginObject>();

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      data: this.data,
    }
  }

  get data() {
    return this.#data
  }

  register(plugin: PluginObject) {
    const id = plugin.id || `_${Math.random().toString(36).substring(2)}`
    this.#plugins.set(id, plugin)
    return this
  }
}

export default Store
