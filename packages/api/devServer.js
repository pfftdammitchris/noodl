const dotenv = require('dotenv')
dotenv.config({ path: '../../.env' })
dotenv.config({ path: './.env' })
const u = require('@jsmanifest/utils')
const { getAbsFilePath } = require('noodl')
const { generate } = require('@graphql-codegen/cli')
const meow = require('meow')

const cli = meow('', {
  flags: { watch: { alias: 'w', type: 'boolean' } },
})

const graphqlEndpoint = 'https://ecos-noodl.hasura.app/v1/graphql'
const log = console.log

log(`Generating graphql files/documents...`)

const generateOptions = {
  schema: getAbsFilePath('./src/documents/**/*.graphql'),
  generates: {
    [getAbsFilePath('./introspection.json')]: {
      plugins: ['introspection'],
    },
    [getAbsFilePath('./src/schema.graphql')]: {
      plugins: ['schema-ast'],
    },
    [getAbsFilePath('./src/types/graphqlTypes.ts')]: {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
  overwrite: true,
}

generate(generateOptions)
  .then(async (generatedFiles) => {
    for (const obj of generatedFiles) {
      log(`Generated ${u.yellow(obj.filename)}`)
    }

    log('Running serverless offline dev server')

    const { default: execa } = await import('execa')

    const shell = execa.command('sls offline', {
      shell: true,
      stdio: 'inherit',
    })

    if (cli.flags.watch) {
      await generate({
        ...generateOptions,
        watch: true,
      })
    }
  })
  .catch((error) => {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  })
