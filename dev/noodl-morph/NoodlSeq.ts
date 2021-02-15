import { YAMLSeq } from 'yaml/types'
import Identify from './utils/Identify'

class NoodlSeq extends YAMLSeq {
	constructor() {
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
