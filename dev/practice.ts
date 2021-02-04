import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import yaml from 'yaml'
import t from 'transducers-js'
import partial from 'lodash/partial'
import partialRight from 'lodash/partialRight'
import createObjectScripts from '../src/api/createObjectScripts'
import scripts from '../src/utils/scripts'
import { loadFiles, traverse } from '../src/utils/common'

const o = createObjectScripts({
	ymlDocs: loadFiles({
		dir: 'data/generated',
		ext: 'yml',
	}),
})

const store = {} as any

if (!Array.isArray(store.actionTypes)) store.actionTypes = []
if (!Array.isArray(store.componentTypes)) store.componentTypes = []
if (!Array.isArray(store.componentKeys)) store.componentKeys = []
if (!Array.isArray(store.references)) store.references = []
if (!Array.isArray(store.styleKeys)) store.styleKeys = []
if (!Array.isArray(store.urls)) store.urls = []
if (!store.actions) store.actions = {}
if (!store.components) store.components = {}
if (!store.emit) store.emit = []
if (!store.funcNames) store.funcNames = []
if (!store.propCombos) store.propCombos = { actions: {}, components: {} }
if (!store.styles) store.styles = {} as any
if (!store.styles.border) store.styles.border = []
if (!store.containedKeys) store.containedKeys = {}

const step = (x) => x

const wrapper = (fn) => (node) => {
	traverse((val) => fn(val, store), node)
	return node
}

const data = o.data()

const xf = t.comp(
	...Object.values(scripts).map((obj) => t.map(wrapper(obj.fn))),
)

// const transduce = t.transduce(xf, step, store, data)

// fs.writeJsonSync('he.json', transduce, { spaces: 2 })
