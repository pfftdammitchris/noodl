class BuiltInCache {
	cache = new Map<string, (...args: any[]) => any>()
}

export default BuiltInCache
