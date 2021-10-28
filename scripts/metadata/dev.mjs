import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import Actions from './Actions.js'

const log = console.log

const actions = new Actions()

actions.add('builtIn', 'funcName')
actions.add('updateObject', ['dataObject', 'dataKey', 'object'])
actions.add('popUp')

log(actions)
