import * as com from 'noodl-common'
import fs from 'fs-extra'
import yaml from 'yaml'

export function getCliConfig() {
	return yaml.parse(fs.readFileSync(com.getAbsFilePath('noodl.yml'), 'utf8'))
}
