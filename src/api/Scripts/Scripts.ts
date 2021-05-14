import { config } from 'dotenv'
config()
import * as u from '@jsmanifest/utils'
import * as tds from 'transducers-js'
import invariant from 'invariant'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import { cyan, yellow, magenta } from '../../utils/common'
import * as t from './types'

const log = console.log
const tag = (s: string) => `[${cyan(s)}]`

class Scripts<Store extends Record<string, any> = Record<string, any>> {
	#store = {} as Store
	#scripts = [] as t.Script.Config<Store>[]
	#dataFilePath = ''
	#hooks = { onStart: [], onEnd: [] } as Record<
		keyof t.Script.Hooks<Store>,
		t.Script.Hooks<Store>[keyof t.Script.Hooks<Store>][]
	>
	docs: (yaml.Document | yaml.Document.Parsed)[] = [];

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return {
			dataFilePath: this.#dataFilePath,
			hooks: this.#hooks,
			numDocs: this.docs.length,
			observers: u
				.entries(this.#hooks)
				.reduce(
					(acc, [hook, fns]) => u.assign(acc, { [hook]: fns?.length || 0 }),
					{},
				),
		}
	}

	constructor(opts: {
		dataFilePath: string
		store?: Store
		docs?: yaml.Document | yaml.Document[]
	}) {
		this.#dataFilePath = opts.dataFilePath || ''
		opts.docs && u.array(opts.docs).forEach((doc) => this.docs.push(doc))
	}

	set dataFilePath(dataFilePath: string) {
		this.#dataFilePath = dataFilePath
		this.ensureDataFile()
	}

	get hooks() {
		return this.#hooks
	}

	ensureDataFile() {
		if (this.#dataFilePath && !fs.existsSync(this.#dataFilePath)) {
			fs.ensureFileSync(this.#dataFilePath)
			fs.writeJsonSync(this.#dataFilePath, this.#store, { spaces: 2 })
			this.#store = this.get()
		}
	}

	get() {
		if (this.#dataFilePath) {
			try {
				return fs.readJsonSync(this.#dataFilePath)
			} catch (error) {
				console.error(error)
			}
		}
		return null
	}

	compose(scripts?: t.Script.Config<Store>[]) {
		const configs = scripts || this.#scripts

		const useComposer = (fn: t.Script.ConsumerFunc) => {
			return (step: <V>(val: V) => V) => {
				return (args: Parameters<t.Script.ConsumerFunc>[0]) => fn(step(args))
			}
		}

		const composed = tds.comp(
			...configs.map((config) => {
				invariant(
					!!config.key,
					`Script config ${magenta(`key`)} is missing ${
						config.label ? `for label ${yellow(config.label)}` : ''
					}`,
				)
				return useComposer(config.fn)
			}),
		)

		const step = <V>(args: V) => args
		const transform = composed(step)

		invariant(
			u.isFnc(transform),
			`The composed ${u.magenta('transform')} function is not a function. ` +
				`Received ${u.red(typeof transform)} instead`,
		)

		function onTransform(doc: yaml.Document | yaml.Document.Parsed) {
			return (...args: Parameters<yaml.visitorFn<unknown>>) => {
				return transform({ doc, node: args[0], key: args[1], path: args[2] })
			}
		}

		return onTransform
	}

	run() {
		invariant(u.isArr(this.docs), `The list of yml docs is not an array`)
		invariant(!!this.docs.length, `There are no yml docs to run with`)

		this.#hooks.onStart.forEach((fn) => {
			invariant(u.isFnc(fn), `onStart fn is not a function`)
			fn(this.#store)
		})

		const chunkedDocs = chunk(this.docs, 8)
		const composed = this.compose()

		log(
			`${tag('Chunks')} ${magenta(
				chunkedDocs.length,
			)} total chunks were created from ${magenta(this.docs.length)} yml docs`,
		)

		for (const docs of chunkedDocs) {
			for (const doc of docs) yaml.visit(doc, composed(doc))
		}

		this.#hooks.onEnd.forEach((fn) => {
			invariant(u.isFnc(fn), `onEnd fn is not a function`)
			fn(this.#store)
		})

		this.save()
	}

	save() {
		if (this.#dataFilePath) {
			try {
				fs.writeJsonSync(this.#dataFilePath, this.#store, { spaces: 2 })
			} catch (error) {
				console.error(error)
			}
		}
		return this.get()
	}

	use(opts: {
		script?: t.Script.Register<Store> | t.Script.Register<Store>[]
		onStart?: t.Script.HooksRegister<Store, 'onStart'>
		onEnd?: t.Script.HooksRegister<Store, 'onEnd'>
	}) {
		opts.onStart && this.#hooks.onStart.push(...u.array(opts.onStart))
		opts.onEnd && this.#hooks.onEnd.push(...u.array(opts.onEnd))
		opts.script &&
			this.#scripts.push(
				...u.array(opts.script).map((config) => {
					invariant(
						u.isFnc(config),
						`Expected a script register function to "use" but received ${typeof config}`,
					)
					return config(this.#store)
				}),
			)
		return this
	}
}

export default Scripts
