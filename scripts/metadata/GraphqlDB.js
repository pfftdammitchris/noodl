class GraphqlDB {
	appName = 'ecos-noodl'
	endpoint = `https://${this.appName}.hasura.app/v1/graphql`
	adminSecret = ''
	personalAccessToken = ''
	graphqlClient = new GraphQLClient(this.endpoint)

	constructor({ adminSecret, personalAccessToken }) {
		this.adminSecret = adminSecret
		this.personalAccessToken = personalAccessToken
	}

	/**
	 *
	 * @param { string } query
	 * @param { Record<string, any> | undefined } variables
	 */
	async send(query, variables) {
		const response = await this.graphqlClient.request(
			query,
			variables,
			this.getHeaders(),
		)
		return response
	}

	/**
	 * @param { Record<string, any> } [headers]
	 */
	getHeaders(headers) {
		return {
			Authorization: `pat ${this.personalAccessToken}`,
			'x-hasura-admin-secret': this.adminSecret,
			...headers,
		}
	}
}

export default GraphqlDB
