const u = require('@jsmanifest/utils')
const execa = require('execa')
const meow = require('meow')

const regex = {
	'noodl-action-chain': /(nac|noodl-action-chain)/i,
	'noodl-common': /(nc|ncom|ncommon|noodl-common)/i,
	'noodl-types': /(nt|types|noodl-types)/i,
}

const cli = meow(``, {
	flags: {
		publish: { alias: 'p', type: 'string' },
		message: { alias: 'm', type: 'string' },
	},
})

const { message = 'Update(s) to lib', publish } = cli.flags

;(async () => {
	const lib = u.entries(regex).find(([_, regex]) => regex.test(publish))[0]

	if (!lib) throw new Error(`Invalid lib name`)

	execa.commandSync(
		[
			`lerna exec --scope ${lib} "npm version patch"`,
			`git add packages/${lib}`,
			`git commit -m "${message}"`,
			`lerna exec --scope ${lib} "npm run build && npm publish"`,
		].join(' && '),
		{
			shell: true,
			stdio: 'inherit',
		},
	)
})()
