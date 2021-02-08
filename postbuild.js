const path = require('path')
const fs = require('fs')

const graphqlSchema = fs.readFileSync(
	path.resolve(path.join(process.cwd(), 'src/generated/schema.graphql')),
	'utf8',
)
console.log(graphqlSchema)

fs.mkdirSync(path.resolve(path.join(process.cwd(), 'dist')))
fs.mkdirSync(path.resolve(path.join(process.cwd(), 'dist/server')))
fs.mkdirSync(path.resolve(path.join(process.cwd(), 'dist/server/graphql')))

fs.writeFileSync(
	path.resolve(path.join(process.cwd(), 'dist/server/graphql/schema.graphql')),
	graphqlSchema,
	'utf8',
)
