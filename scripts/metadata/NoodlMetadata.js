import Firebase from 'firebase-admin'

class NoodlMetadata {
	#credentials
	/** @type { Firebase.app.App } */
	#firebase

	/**
	 * @param { object } options
	 * @param { object } options.credentials
	 * @param { object } options.credentials.firebase
	 * @param { object } options.credentials.firebase.serviceAccount
	 */
	constructor(options) {
		this.#credentials = options.credentials
	}

	createFirebaseClient() {
		this.#firebase = Firebase.initializeApp({
			credential: Firebase.credential.cert(
				this.#credentials.firebase.serviceAccount,
			),
		})
		return this.#firebase
	}

	getFirebase() {
		if (this.#firebase) return this.#firebase
		return this.createFirebaseClient()
	}

	getDb() {
		if (this.#firebase) return this.#firebase.firestore()
		return this.getFirebase().firestore()
	}
}

export default NoodlMetadata
