class ReferenceCache {
	cache = new Map()

	getOrCreate({ key, pageName }) {
		return this.cache.get(key)
	}

	set({ key, value, pageName }) {
		if (this.cache.get(pageName)) {
			//
		}
		// this.cache.set()
	}
}

export default ReferenceCache
