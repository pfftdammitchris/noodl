import execa from 'execa'

const cmds = [
  `npm run bootstrap`,
  `lerna exec --scope noodl-utils npm run build`,
  `lerna exec --scope noodl npm run build`,
  `lerna exec --scope noodl-cli npm run build`,
]

for (const cmd of cmds) {
  execa.commandSync(cmd, { shell: true, stdio: 'inherit' })
}
