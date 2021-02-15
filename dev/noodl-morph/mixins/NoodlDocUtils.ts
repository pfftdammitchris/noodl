import { Mixin } from '../utils/mix'

const NoodlDocUtilsMixin = Mixin((superclass) => {
	return class extends superclass {
		getAllReferences() {}
	}
})

export default NoodlDocUtilsMixin
