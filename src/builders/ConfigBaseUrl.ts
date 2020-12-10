class ConfigBaseUrlBuilder {
	#designSuffix: string
	#version: number | string
	hostname: string
	protocol = 'https://'

	constructor(hostname: string = 'public.aitmed.com') {
		this.hostname = hostname
	}

	get designSuffix() {
		return this.#designSuffix
	}

	get version() {
		return this.#version
	}

	setDesignSuffix(designSuffix: any) {
		this.designSuffix = designSuffix
		return this
	}

	setVersion(version: number) {
		this.version = version
		return this
	}

	toString() {
		return this.#replaceVersionPlaceholder(
			`${this.protocol}${this.hostname}/${this.version}`,
			this.version,
		)
	}

	#replaceDesignSuffixPlaceholder = (str: string, value: any) =>
		str.replace(/\${designSuffix}/gi, String(value))

	#replaceVersionPlaceholder = (str: string, value: any) =>
		str.replace(/\${cadlVersion}/gi, String(value))
}
