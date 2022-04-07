const u = require('@jsmanifest/utils')
const fs = require('fs-extra')
const path = require('path')
const Typedoc = require('typedoc')

const typedoc = new Typedoc.Application()
const entryPoints = [path.join(__dirname, '../packages/noodl')]
const outDir = path.join(__dirname, '../data')

async function main() {
  // If you want Typedoc to load tsconfig.json / typedoc.json files
  typedoc.options.addReader(new Typedoc.TSConfigReader())
  typedoc.options.addReader(new Typedoc.TypeDocReader())

  typedoc.bootstrap({
    entryPoints,
    categorizeByGroup: true,
    emit: 'docs',
    entryPointStrategy: 'Packages',
    logLevel: 'Verbose',
    lightHighlightTheme: 'github-light',
    darkHighlightTheme: 'material-ocean',
    json: true,
    showConfig: true,
    pretty: true,
    out: path.join(outDir, 'noodl'),
  })

  const project = typedoc.convert()

  if (project) {
    // Project may not have converted correctly
    const outputDir = '../data/noodlDocs'
    // Rendered docs
    await typedoc.generateDocs(project, outputDir)
    // Alternatively generate JSON output
    await typedoc.generateJson(project, outputDir + '/documentation.json')
  }

  console.log(project)
}

main().catch(console.error)
