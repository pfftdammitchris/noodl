import yaml from 'yaml'
import axios from 'axios'
import { prettifyErr } from '../utils/common'

export interface JsonYmlBoolean {
	json: boolean
	yml: boolean
}

class NOODLObjects {
	name: string
	objects: {
		[name: string]: {
			json: any
			yml?: string
		}
	} = {}
	options: {
		keepYml: boolean
	} = { keepYml: false }

	constructor(name: string = '') {
		this.name = name
	}

	get(key: string | RegExp, { asYml }: { asYml?: boolean } = {}): any {
		if (key) {
			if (typeof key === 'string') {
				return asYml ? this.objects[key]?.yml : this.objects[key]?.json
			} else if (key instanceof RegExp) {
				const results = {} as any
				const keys = Object.keys(this.objects)
				for (let index = 0; index < keys.length; index++) {
					const k = keys[index] as string
					if (key.test(k)) results[k] = this.objects[k]
				}
				return results
			}
		}
	}

	async load<T extends {} = any>(
		name: string,
		url: string,
	): Promise<{ json: T; yml?: string }> {
		try {
			const { data: yml } = await axios.get(url)
			this.objects[name] = { json: yaml.parse(yml), yml }
			return { json: this.objects[name]?.json, yml }
		} catch (error) {
			prettifyErr(error)
			return { json: {} as T, yml: '' }
		}
	}
}

export default NOODLObjects
