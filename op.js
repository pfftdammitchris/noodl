const u = require('@jsmanifest/utils')
const execa = require('execa')
const fs = require('fs-extra')
const meow = require('meow')
const path = require('path')
const rimraf = require('rimraf')

const getAbsFilePath = (...s) => path.resolve(path.join(...s))

const lib = {
  cli: { name: 'noodl-cli', path: getAbsFilePath('packages/noodl-cli') },
  noodl: { name: 'noodl', path: getAbsFilePath('packages/noodl') },
  nag: {
    name: 'noodl-aggregator',
    path: getAbsFilePath('packages/noodl-aggregator'),
  },
  nac: {
    name: 'noodl-action-chain',
    path: getAbsFilePath(`packages/noodl-action-chain`),
  },
  nc: { name: 'noodl-common', path: getAbsFilePath('packages/noodl-common') },
  nt: { name: 'noodl-types', path: getAbsFilePath('packages/noodl-types') },
  nu: { name: 'noodl-utils', path: getAbsFilePath('packages/noodl-utils') },
}

const cli = meow(``, {
  flags: {
    cli: { type: 'string' },
    lerna: { type: 'string', alias: 'l' },
    noodl: { type: 'string' },
    nag: { type: 'string' },
    nac: { type: 'string' },
    nc: { type: 'string' },
    nt: { type: 'string' },
    nu: { type: 'string' },
    rmjs: { type: 'string' },
    watch: { type: 'boolean' },
  },
})

const { flags, input } = cli

if (cli.flags.rmjs) {
  const { rmjs: name } = cli.flags

  function rm(name) {
    const paths = [
      path.resolve(path.join(process.cwd(), `packages/${name}/src/*.js`)),
      path.resolve(path.join(process.cwd(), `packages/${name}/src/*.js.map`)),
      path.resolve(path.join(process.cwd(), `packages/${name}/src/*.d.ts`)),
    ]
    for (const p of paths) {
      console.log(`[${u.cyan('running')}] on path: ${u.yellow(p)}`)
      rimraf(p, function (err) {
        if (err) u.throwError(err)
      })
    }
  }

  if (name === 'all') {
    u.forEach(({ name }) => rm(name), u.values(lib))
  } else {
    rm(name)
  }
} else if (cli.flags.lerna) {
  const arg = cli.input[0]
  const cmd = ['lerna', 'exec', '--scope', flags.lerna, '']

  let inputs = `""`

  if (arg === 'test') inputs += `npm run test`
  else if (arg === 'start') inputs += `npm run start`
  else if (arg === 'build') inputs += `npm run build`

  inputs += `""`

  execa.commandSync(cmd.join(' ').concat(inputs), {
    shell: true,
    stdio: 'inherit',
  })
}
