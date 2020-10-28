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
			json: { [key: string]: any }
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
					const k = keys[index]
					if (key.test(k)) results[k] = this.objects[k]
				}
				return results
			}
		}
	}

	async fetchObject(name: string, url: string): Promise<any> {
		try {
			const { data: yml } = await axios.get(url)
			this.objects[name] = { json: yaml.parse(yml) }
			this.objects[name]['yml'] = this.options.keepYml ? yml : ''
			return this.objects[name]
		} catch (error) {
			prettifyErr(error)
		}
	}
}

export default NOODLObjects
