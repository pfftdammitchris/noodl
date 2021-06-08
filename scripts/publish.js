const execa = require('execa')
const meow = require('meow')

const cli = meow(``, {
	flags: {
		publish: { alias: 'p', type: 'string' },
		message: { alias: 'm', type: 'string' },
	},
})

const { message = 'Update(s) to lib', publish } = cli.flags

;(async () => {
	const lib = {
		noodlActionChain: 'noodl-action-chain',
		noodlTypes: 'noodl-types',
	}

	const regex = {
		[lib.noodlActionChain]: /(nac|noodl-action-chain)/i,
		[lib.noodlTypes]: /(nt|types|noodl-types)/i,
	}

	const libName = regex[lib.noodlActionChain].test(publish)
		? lib.noodlActionChain
		: regex[lib.noodlTypes].test(publish)
		? lib.noodlTypes
		: undefined

	if (!libName) throw new Error(`Invalid lib name`)

	execa.commandSync(
		[
			`lerna exec --scope ${libName} "npm version patch"`,
			`git add packages/${libName}`,
			`git commit -m "${message}"`,
			`lerna exec --scope ${libName} "npm run build && npm publish"`,
		].join(' && '),
		{
			shell: true,
			stdio: 'inherit',
		},
	)
})()
