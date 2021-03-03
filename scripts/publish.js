const childProcess = require('child_process')
const chalk = require('chalk').default
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
	}

	if (['nac', lib.noodlActionChain].includes(args.publish)) {
		const message = args.message || 'Update(s) to lib'
		const commands = [
			`lerna exec --scope ${lib.noodlActionChain} "npm version patch"`,
			`git add packages/${lib.noodlActionChain}`,
			`git commit -m "${message}"`,
			`lerna exec --scope ${lib.noodlActionChain} "npm run build && npm publish"`,
		]
		const commandString = commands.join(' && ')
		const shell = childProcess.spawn(commandString, {
			shell: true,
			stdio: 'inherit',
		})
	}
})()
