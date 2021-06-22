import * as nc from 'noodl-common'
import fs from 'fs-extra'
import path from 'path'

const pathToYmlFiles = path.resolve(path.join(__dirname, '../generated'))
const filepaths = nc.readdirSync(pathToYmlFiles, { glob: '**/*.jpeg' })

console.log(filepaths)
console.log(filepaths.length)
