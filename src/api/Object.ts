class NOODLObject {
	yml: string = ''
	json: any = null

	constructor({ yml = '', json = null }: { yml?: string; json?: any } = {}) {
		this.yml = yml
		this.json = json
	}
}

export default NOODLObject
