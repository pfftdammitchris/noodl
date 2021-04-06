const childProcess = require('child_process')
const { Command } = require('commander')

const program = new Command()

program
	.option('-p --publish [pkg]', 'Quickly publish a library')
	.option('-m --message [message]', 'Commit message')

program.parse(process.argv)

const args = program.opts()

;(async () => {
	const lib = {
		noodlActionChain: 'noodl-action-chain',
		noodlTypes: 'noodl-types',
	}

	const regex = {
		[lib.noodlActionChain]: /(nac|noodl-action-chain)/i,
		[lib.noodlTypes]: /(nt|types|noodl-types)/i,
	}

	const libName = regex[lib.noodlActionChain].test(args.publish)
		? lib.noodlActionChain
		: regex[lib.noodlTypes].test(args.publish)
		? lib.noodlTypes
		: undefined

	if (!libName) {
		throw new Error(`Invalid lib name`)
	}

	const message = args.message || 'Update(s) to lib'
	const commands = [
		`lerna exec --scope ${libName} "npm version patch"`,
		`git add packages/${libName}`,
		`git commit -m "${message}"`,
		`lerna exec --scope ${libName} "npm run build && npm publish"`,
	]
	const commandString = commands.join(' && ')
	const shell = childProcess.spawn(commandString, {
		shell: true,
		stdio: 'inherit',
	})
	return
})()
