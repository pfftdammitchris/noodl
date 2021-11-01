import * as nt from 'noodl-types'
import NoodlNode from './Node.js'

class NoodlReference<V = any> extends NoodlNode<V> {
	rootKey = ''
	value: V;

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toJSON()
	}

	constructor(value: V, rootKey = '') {
		super(value)
		this.rootKey = rootKey
	}

	isReference() {
		return nt.Identify.reference(this.value as any)
	}

	isLocalReference() {
		return nt.Identify.localReference(this.value as any)
	}

	isRootReference() {
		return nt.Identify.rootReference(this.value as any)
	}

	isEvalReference() {
		return nt.Identify.evalReference(this.value as any)
	}

	isEvalLocalReference() {
		return nt.Identify.evalLocalReference(this.value as any)
	}

	isEvalRootReference() {
		return nt.Identify.evalRootReference(this.value as any)
	}

	isAwaitRootReference() {
		return nt.Identify.awaitReference(this.value as any)
	}

	isTildeReference() {
		return nt.Identify.tildeReference(this.value as any)
	}

	isTraverseReference() {
		return nt.Identify.traverseReference(this.value as any)
	}

	toJSON() {
		return {
			value: this.value,
			reference: this.isReference(),
			// TODO - Missing isAwaitLocalReference()
			isAwaitReference: this.isAwaitRootReference(),
			isRootReference: this.isRootReference(),
			isLocalReference: this.isLocalReference(),
			isEvalReference:
				this.isEvalLocalReference() || this.isEvalRootReference(),
			isTildeReference: this.isTildeReference(),
			isTraverseReference: this.isTraverseReference(),
		}
	}

	toString() {
		return JSON.stringify(this.toJSON(), null, 2)
	}
}

export default NoodlReference
