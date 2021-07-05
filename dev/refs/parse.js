const u = require('@jsmanifest/utils')
const yaml = require('yaml')

/** @param { string | import("../../packages/noodl-types/dist").RootConfig | yaml.Document<any> } rootConfig */
const parse = function (rootConfig) {
	const rootConfigDoc = yaml.isDocument(rootConfig)
		? rootConfig
		: u.isStr(rootConfig)
		? yaml.parseDocument(rootConfig)
		: yaml.parseDocument(yaml.stringify(rootConfig))

	const startPage = rootConfigDoc.get('startPage')
}

module.exports = parse
