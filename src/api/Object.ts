class NOODLObject<Obj = any> {
	yml: string = ''
	json: Obj | null = null

	constructor({ yml = '', json = null }: { yml?: string; json?: any } = {}) {
		this.yml = yml
		this.json = json
	}
}

export default NOODLObject
