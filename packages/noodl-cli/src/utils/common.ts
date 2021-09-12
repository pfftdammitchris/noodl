import * as nc from 'noodl-common'
import fs from 'fs-extra'
import yaml from 'yaml'

export function getCliConfig() {
	return yaml.parse(fs.readFileSync(nc.getAbsFilePath('noodl.yml'), 'utf8'))
}
