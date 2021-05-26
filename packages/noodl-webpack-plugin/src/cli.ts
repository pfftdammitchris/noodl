process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import meow from 'meow'

const startCmd = `${u.white(`npm run`)} ${u.yellow(`node start`)}`
const withArgs = (s) => `${u.magenta(s)}`

// prettier-ignore
const cli = meow(
  `
  ${u.white(`Usage`)}

  $ ${startCmd} Will use the config in src/app/noodl.ts
  $ ${startCmd} ${withArgs(`--config meet4d`)} Will use meet4d.yml config in test (the default) environment
  $ ${startCmd} ${withArgs(`-c testpage --env stable`)} Will use testpage.yml config in stable environment
  $ ${startCmd} ${withArgs(`-e stable`)} Will use the config in src/app/noodl.ts in stable environment
  $ ${startCmd} ${withArgs(`--config=meet2d --env test -p 3005`)} Will use port 3005 for the web app
  $ ${startCmd} ${withArgs(`--config=meet2d --env test --serverPort 8080`)} Will use port 8080 for the server serving noodl files
  
`,
  {
    flags: {
      config: { alias: 'c', type: 'string' },
      env: { alias: 'e', type: 'string', default: 'test' },
      port: { alias: 'p', type: 'number', default: 3000 },
      serverDir: {type:'string',default:'server'},
      serverPort: {  type: 'number', default: 3001 },
    },
  },
)

export default cli
