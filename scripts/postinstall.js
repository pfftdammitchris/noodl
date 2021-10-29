import execa from 'execa'

const cmds = [
	`npm run bootstrap`,
	`lerna exec --scope noodl-common npm run build`,
	`lerna exec --scope noodl-aggregator npm run build`,
	`lerna exec --scope noodl-cli npm i`,
	`npm run build`,
]

for (const cmd of cmds) {
	execa.commandSync(cmd, { shell: true, stdio: 'inherit' })
}
