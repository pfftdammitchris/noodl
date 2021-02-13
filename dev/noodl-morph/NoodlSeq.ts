import { YAMLSeq } from 'yaml/types'
import Identify from './Identify'

class NoodlSeq extends YAMLSeq {
	constructor(args) {
		super()
	}

	isActionChain() {
		return Identify.actionChain(this)
	}

	isInit() {
		return Identify.init(this)
	}
}

export default NoodlSeq
