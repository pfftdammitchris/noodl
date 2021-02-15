import { Mixin } from '../utils/mix'

const NoodlRootMixin = Mixin((superclass) => {
	return class extends superclass {
		get BaseCSS() {
			return this.getRoot()['BaseCSS']
		}

		get BaseDataModel() {
			return this.getRoot()['BaseDataModel']
		}

		get BasePage() {
			return this.getRoot()['BasePage']
		}

		get Global() {
			return this.getRoot()['Global']
		}

		getRoot() {
			//
		}

		use() {
			//
		}
	}
})

export default NoodlRootMixin
