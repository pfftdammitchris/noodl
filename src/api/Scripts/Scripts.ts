import { AcceptArray } from '@jsmanifest/typefest'
import curry from 'lodash/curry'
import * as u from '@jsmanifest/utils'
import * as tds from 'transducers-js'
import invariant from 'invariant'
import yaml from 'yaml'
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import * as co from '../../utils/color'
import * as t from './types'

const log = console.log
const tag = (s: string) => `[${co.cyan(s)}]`

class Scripts<Store extends Record<string, any> = Record<string, any>> {
	#store = {} as Store
	#scripts = [] as t.Script.Config<
		Store,
		keyof Store,
		t.Script.ScriptDataType
	>[]
	#dataFilePath = ''
	#hooks = { onStart: [], onEnd: [] } as Record<
		keyof t.Script.Hooks<Store>,
		t.Script.Hooks<Store>[keyof t.Script.Hooks<Store>][]
	>
	docs: {
		name: string
		doc: yaml.Document<yaml.Node> | yaml.Document.Parsed<any>
	}[] = [];

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
		docs?: AcceptArray<Scripts<Store>['docs'][number]>
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

	get store() {
		return this.#store
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

	compose(scripts?: ReturnType<t.Script.Register<Store>>[]) {
		const configs = scripts || this.#scripts

		const useCurriedTransformComposer = curry(
			(
				fn: t.Script.ConsumerFunc,
				step: <V>(val: V) => V,
				args: Parameters<t.Script.ConsumerFunc>[0],
			) => {
				fn(args)
				return step(args)
			},
		)

		const registeredScripts = configs.map((config) =>
			useCurriedTransformComposer(config.fn),
		)

		const createTransform = tds.comp(
			...(registeredScripts.length == 1 ? [tds.identity] : []),
			...registeredScripts,
		)

		const step = <V>(args: V) => args
		const transform = createTransform(step)

		invariant(
			u.isFnc(transform),
			`The composed ${u.magenta('transform')} function is not a function. ` +
				`Received ${u.red(typeof transform)} instead`,
		)

		function onTransform(obj: Scripts<Store>['docs'][number]) {
			return (...[key, node, path]: Parameters<yaml.visitorFn<yaml.Node>>) => {
				return transform({
					name: obj.name,
					doc: obj.doc,
					key,
					node,
					path,
				})
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
			`${tag('Chunks')} ${co.magenta(
				chunkedDocs.length,
			)} total chunks were created from ${co.magenta(
				this.docs.length,
			)} yml docs`,
		)

		for (const docs of chunkedDocs) {
			for (const obj of docs) {
				// @ts-expect-error
				yaml.visit(obj.doc, composed(obj))
			}
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
		script?: AcceptArray<t.Script.Register<Store>>
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
					const _config = config(this.#store)
					invariant(
						!!_config.key,
						`Missing script ${co.italic(co.yellow(`key`))}`,
					)
					!_config.type && (_config.type = 'array')

					this.#store[_config.key as keyof Store] =
						_config.type === 'map'
							? (new Map() as any)
							: _config.type === 'object'
							? ({} as Record<string, any>)
							: ([] as any[])

					return _config
				}),
			)
		return this
	}
}

export default Scripts
