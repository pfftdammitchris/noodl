const fs = require('fs-extra')
const path = require('path')
const globby = require('globby')
const { loadFiles } = require('@graphql-tools/load-files')

const pathToGraphqlDocs = 'src/server/graphql'
const pathToOutputFile = 'src/generated/typeDefs.ts'
const graphqlDocsGlob = '**/*.graphql'

globby(pathToGraphqlDocs)
	.then(() =>
		loadFiles(path.join(pathToGraphqlDocs, graphqlDocsGlob), {
			recursive: true,
		}),
	)
	.then((typeDefStrings) =>
		fs.writeFileSync(
			pathToOutputFile,
			`import { gql } from 'apollo-server-express'\n\n` +
				`const typeDefs = gql\`\n` +
				`${typeDefStrings
					.join('\n')
					.split('\n')
					.map((s) => `  ${s}`)
					.join('\n')}` +
				'\n`' +
				`\n\nexport default typeDefs\n`,
			'utf8',
		),
	)
	.catch((err) => {
		throw err
	})
