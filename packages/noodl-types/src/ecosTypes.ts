export interface EcosDocument<NameField = any> {
	id: null | string
	ctime: null | number
	mtime: null | number
	atime: null | number
	atimes: null | number
	tage: null | number
	subtype: {
		isOnServer: null | boolean
		isZipped: null | boolean
		isBinary: null | boolean
		isEncrypted: null | boolean
		isEditable: null | boolean
		applicationDataType: null | number
		mediaType: null | number
		size: null | number
	}
	type: null | number
	name: null | NameField
	deat: null | number
	size: null | number
	fid: null | string
	eid: null | string
	bsig: null | string
	esig: null | string
	created_at: null | number
	modified_at: null | number
}
