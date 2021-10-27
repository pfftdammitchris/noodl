/**
 *
 * @param { GraphqlDB } graphqldb
 */
const GraphqldbAPI = function (graphqldb) {
	/**
	 * @param { string } actionType
	 * @param { string | string[] } [propertiesProp]
	 */
	async function createActionType(actionType, propertiesProp = []) {
		try {
			let isCreating = true
			let properties = u.array(propertiesProp)
			let { actions: currentActions } = await getActionTypes()
			let item = currentActions.find((o) => o.actionType === actionType)

			if (!item) item = { actionType, properties: [] }
			else isCreating = false

			if (!isCreating) {
				const newProperties = []

				for (const prop of properties) {
					if (prop && !newProperties.includes(prop)) newProperties.push(prop)
				}

				if (newProperties.length) {
					log(
						`Action type "${actionType}" already exists. Redirecting to updateActionTypeProperties instead`,
					)
					return updateActionTypeProperties(actionType, { add: newProperties })
				} else {
					throw new Error(
						`An item with action type "${actionType}" already exists in the database with all of the ${properties.length} properties provided`,
					)
				}
			}

			return graphqldb.send(
				gql`
					mutation ($actionType: String, $properties: json) {
						insert_actions_one(
							object: { actionType: $actionType, properties: $properties }
						) {
							properties
							actionType
						}
					}
				`,
				{ actionType, properties },
			)
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	/**
	 * @param { string } actionType
	 * @param {{ add?: string | string[]; remove?: string | string[] }} properties
	 */
	async function updateActionTypeProperties(actionType, { add, remove }) {
		try {
			const { actions: currentActions } = await getActionTypes()
			const item = currentActions.find((o) => o.actionType === actionType)

			if (item) {
				const properties = [...item.properties]
				const added = []
				const removed = []

				if (add) {
					u.forEach((prop) => {
						if (!properties.includes(prop)) {
							added.push(prop)
							properties.push(prop)
						}
					}, u.array(add))
				}

				if (remove) {
					u.forEach((prop) => {
						if (properties.includes(prop)) {
							const index = properties.indexOf(prop)

							if (index > -1) {
								const prop = properties[index]
								properties.splice(index, 1)
								if (added.includes(prop)) {
									added.splice(added.indexOf(prop), 1)
									removed.push(prop)
								}
							}
						}
					}, u.array(remove))
				}

				await graphqldb.send(
					gql`
						mutation ($actionType: String!, $properties: json) {
							update_actions_by_pk(
								pk_columns: { actionType: $actionType }
								_set: { properties: $properties }
							) {
								properties
							}
						}
					`,
					{ actionType, properties },
				)

				return { added, removed }
			} else {
				throw new Error(
					`Action type "${actionType}" does not exist in the database`,
				)
			}
		} catch (error) {
			if (error instanceof Error) throw error
			throw new Error(String(error))
		}
	}

	/**
	 *
	 * @returns {Promise<{ actions: { actionType: string; properties: string[] }[]>}}
	 */
	async function getActionTypes() {
		try {
			return {
				actions:
					(
						await graphqldb.send(gql`
							query {
								actions {
									actionType
									properties
								}
							}
						`)
					)?.actions || [],
			}
		} catch (error) {
			throw error
		}
	}

	const o = {
		createActionType,
		getActionTypes,
		updateActionTypeProperties,
	}

	return o
}

export default GraphqldbAPI
