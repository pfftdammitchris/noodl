// @ts-nocheck
import fs from 'fs-extra'
import { GraphQLFieldResolver } from 'graphql'
import { getFilepath } from '../../utils/common'

const Query: { [key: string]: GraphQLFieldResolver<any, any> } = {
	async goto(
		root,
		args: { destination?: string; goto?: string; page?: string },
		context,
	) {
		console.log(page)
		console.log(goto)
		console.log(goto)
		let { destination, goto, page } = args
		page = page || destination || goto
		const filename = `${page}.yml`
		const filepath = getFilepath('server', filename)
		return fs.readFile(filepath, 'utf8')
	},
}

const Mutation = {
	sendEmit(root) {
		//
	},
}

export default {
	Query,
	Mutation,
}
