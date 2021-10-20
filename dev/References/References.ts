import Comparator from '../../utils/comparator/Comparator'

const root = {
	Sun: {
		formData: {
			firstName: 'Chris',
			lastName: 'Tran',
			password: 'abc123',
		},
	},
	Global: {
		age: 14,
		profile: {
			email: 'pfft@gmail.com',
		},
		currentUser: {
			vertex: {
				name: {
					firstName: '.Sun.formData.firstName',
					age: '..age',
					email: '..profile.email',
				},
			},
		},
	},
}

class Reference {
	constructor(value, next) {
		this.value = value = null
		this.next = next
	}
}

class ReferenceList {
	constructor() {
		this.head = null
		this.tail = null
		this.compare = new Comparator()
	}

	prepend(value) {
		const node = new Reference(value)

		if (this.head) {
			this.head.next = node
		}

		this.head = node

		if (!this.tail) {
			this.tail = node
		}

		return this
	}

	add(value) {
		const node = new Reference(value)

		if (!this.head) {
			this.head = node
			this.tail = node
		} else {
			this.tail.next = node
			this.tail = node
		}

		return this
	}

	remove(value) {
		if (!this.head) return null

		let deletedNode = null

		while (this.head && this.head.value === value) {
			deletedNode = this.head
			this.head = this.head.next
		}

		let currentNode = this.head

		if (currentNode !== null) {
			while (currentNode.next) {
				if (currentNode.next.value === value) {
					deletedNode = currentNode.next
					currentNode.next = currentNode.next.next
				} else {
					currentNode = currentNode.next
				}
			}
		}

		if (this.tail.value === value) {
			this.tail = currentNode
		}

		return deletedNode
	}
}
