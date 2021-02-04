import axios from 'axios'
import chalk from 'chalk'
import { gql, ApolloError } from 'apollo-server'

async function start() {
	const { data } = await axios.get('http://127.0.0.1:4000', {
		params: {
			query: `
				query GotoQuery($page: String!) {
					goto(page: $page)
				}
			`,
			variables: {
				page: '1',
			},
		},
	})
	console.log(data)
	return data
}

start().catch((err) => {
	console.log('')
	if (err.response.data) {
		const errors: ApolloError[] = err.response.data.errors
		errors.forEach((apolloErr) => {
			console.log(
				`[${chalk.red(
					apolloErr.extensions?.code || apolloErr.name,
				)}]: ${chalk.yellow(apolloErr.message)}`,
			)
		})
	} else {
		console.log(`[${chalk.red(err.name)}]: ${chalk.yellow(err.message)}`)
	}
})
