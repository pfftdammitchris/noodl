process.stdout.write('\x1Bc')
const nc = require('noodl-common')
const path = require('path')
const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const { Identify } = require('noodl-types')
const fs = require('fs-extra')
const ncom = require('noodl-common')
const Aggregator = require('noodl-aggregator').default
const Protorepo = require('@aitmed/protorepo')
const Reference = require('./Reference')

const configKey = 'meet4d'
const basePath = '../../generated'
const pathToOutputFile = ncom.normalizePath(
	__dirname,
	`${basePath}/refs-output.json`,
)
const refs = new yaml.Document()

/** @param { string | string[] } paths */
function toPaths(paths) {
	return u.isStr(paths) ? Identify.reference.format(paths).split('.') : paths
}

/**
 * @param { yaml.YAMLMap<any, any> } node
 * @param { string | string[] } paths
 * @returns { any }
 */
function getInMap(node, paths) {
	if (node.items.length) return node.getIn(toPaths(paths))
	return node
}

/**
 * @param { object } opts
 * @param { yaml.Document<any> } opts.refs
 * @param { string } opts.context
 * @param { Reference } opts.reference
 * @param { yaml.Scalar<string> } opts.node
 * @param { Map<string, yaml.Node | yaml.Document<any>> } opts.root
 */
function insertToRefs({
	refs,
	context,
	reference,
	node,
	root,
	mergeWithOutput,
}) {
	if (!refs.has(context)) refs.set(context, new yaml.YAMLSeq())
	/** @type { yaml.YAMLSeq<any> } */
	const entry = refs.get(context)

	if (!entry) {
		console.log(u.red(`No entry was found for context: ${context}`))
	} else {
		const newEntry = refs.createNode({
			...reference.toJSON(),
		})

		console.log(`mergeWithOutput`, mergeWithOutput)

		entry.add(newEntry)
	}
}

/**
 * @param { yaml.Document } refs
 * @param { yaml.Document } doc
 * @param { Map } root
 */
const parse = function ({ context = '', refs, doc, root }) {
	yaml.visit(doc, {
		Scalar: (key, node) => {
			if (Identify.reference(node.value)) {
				const reference = new Reference(node, { context })

				if (context === 'BaseDataModel') {
					reference.context = reference.paths[0]
				}

				if (reference.isRoot()) {
					console.log(
						`[${u.cyan('ROOT')}]: ${u.white(reference)} (${nc.magenta(
							context,
						)})`,
					)

					const localDoc = root.get(reference.paths[0])
					const yamlMap = yaml.isMap(localDoc)
						? localDoc
						: yaml.isDocument(localDoc) &&
						  yaml.isMap(localDoc.contents) &&
						  localDoc.contents

					if (yamlMap) {
						const paths = reference.paths.slice(1)
						reference.value = getInMap(yamlMap, paths)
						insertToRefs({
							context,
							node,
							root,
							refs,
							reference,
							mergeWithOutput: {
								exists: yamlMap.hasIn(paths),
							},
						})
					}
				} else if (reference.isLocal()) {
					console.log(
						`[${nc.coolGold('LOCAL')}]: ${u.white(reference)} (${nc.magenta(
							context,
						)})`,
					)

					const yamlMap = yaml.isMap(doc)
						? doc
						: (yaml.isDocument(doc) &&
								yaml.isMap(doc.contents) &&
								doc.contents) ||
						  doc

					if (yamlMap) {
						reference.value = getInMap(yamlMap, reference.paths)
						insertToRefs({
							context,
							node,
							root,
							refs,
							reference,
							mergeWithOutput: {
								exists: yamlMap.hasIn(reference.paths),
							},
						})
					}
				}
			}
		},
	})
}

const options = {
	deviceType: 'ios',
	phoneNumber: `+18882461234`,
	password: '142251',
}

const builtIn = {
	array: {
		add: () => {},
		addByIndex: () => {},
		SortBy: () => {},
		clear: () => {},
		removeByKey: () => {},
		removeByName: () => {},
		removeByValue: () => {},
		removeById: () => {},
		removeByIndex: () => {},
		removeWeekByIndexs: () => {},
		append: () => {},
		appendUnique: () => {},
		addColor: () => {},
		has: () => {},
		hasKey: () => {},
		AddWeek: () => {},
		push: () => {},
		covertToJsonArray: () => {},
		getListLength: () => {},
		copyByKey: () => {},
		changeColorByKey: () => {},
		convertToList: () => {},
		getByKey: () => {},
		getConnection: () => {},
		getFavorites: () => {},
		getFirstItem: () => {},
		concatArray: () => {},
		isExist: () => {},
		createBySubtype: () => {},
		WeekSchedule: () => {},
		concat: () => {},
		getIdByUserName: () => {},
		removeByArray: () => {},
		toggleStatus: () => {},
		getPage: () => {},
		getPageIndex: () => {},
		elementUnique: () => {},
		addProvider: () => {},
		handleData: () => {},
		transformNull: () => {},
		isEmpty: () => {},
		selectOneToArr: () => {},
		matchInArray: () => {},
		vuetify: () => {},
		toString: () => {},
	},
	cleanLocalStorage: () => {},
	createNewAccount: async ({ name }) => {},
	currentDateTime: () => {},
	date: {
		getDate: () => {},
		getMonth: () => {},
		getYear: () => {},
		getTimezoneOffset: () => {},
		getTime: () => {},
		stampToDate: () => {},
		stampToTime: () => {},
		getTimeStampOfDate: () => {},
		LoopToGenerate: () => {},
		calendarArray: () => {},
		splitByTimeSlot: () => {},
		splitTime: () => {},
		ShowTimeSpan: () => {},
		ShowTimeDate: () => {},
		ShowTimeSpanFormat: () => {},
		minicalendarArray: () => {},
		loopMonth: () => {},
		miniWeeklyCalendarArray: () => {},
		NextWeek: () => {},
		LastWeek: () => {},
		AddHeightByTimeSpan: () => {},
		ShowRightTime: () => {},
		ShowLeftTime: () => {},
		ShowDateByNumber: () => {},
		TransformWeekDate: () => {},
		transformMonth: () => {},
		getDurationByMinute: () => {},
		startMeeting: () => {},
		transformSelectWeek: () => {},
		isType: () => {},
	},
	downloadFromS3: async () => {},
	eccNaCl: {
		signature: () => {},
		verifySignature: () => {},
		decryptAES: () => {},
		encryptAES: () => {},
		skCheck: () => {},
		generateESAK: () => {},
		decryptData: () => {},
		decryptESAK: () => {},
		isEdgeEncrypted: () => {},
		getSAKFromEdge: () => {},
	},
	FCM: {
		getFCMToken: () => {},
		getAPPID: () => {},
		getFCMTokenSHA256Half: () => {},
	},
	isIOS: () => options.deviceType === 'ios',
	isAndroid: () => options.deviceType === 'android',
	loginByPassword: (password) => {},
	number: {
		inRange: () => {},
		multiply: () => {},
		OctToBin: () => {},
		getAuthority: () => {},
		addition: () => {},
		Subtraction: () => {},
		less: () => {},
		inhx: () => {},
		hexAnd: () => {},
		hexOr: () => {},
		hx: () => {},
	},
	object: {
		remove: () => {},
		clear: () => {},
		set: () => {},
		get: () => {},
		has: () => {},
		clearAndSetKey: () => {},
		extract: () => {},
		extractArray: () => {},
		authToSubType: () => {},
		findTrue: () => {},
		setAuthAllTrue: () => {},
		isEmpty: () => {},
		setByKey: () => {},
		getObjValueAndKey: () => {},
		getObjKey: () => {},
	},
	payment: {
		createSqPaymentForm: () => {},
		getPaymentNonce: () => {},
	},
	search: {
		transformGeo: () => {},
		suggest: () => {},
		queryByDate: () => {},
		GetAllLonAndLat: () => {},
		SortBySpeciality: () => {},
		processingSearchData: () => {},
	},
	stringCompare: (str1, str2) => str1 === str2,
	storeCredentials: ({ pk, sk, esk, userId }) => {},
	signIn: async () => {},
	SignInOk: async () => true,
	string: {
		formatTimer: () => {},
		formatUnixtime_en: () => {},
		formatUnixtimeL_en: () => {},
		formatUnixtimeLT_en: () => {},
		formatDurationInSecond: () => {},
		concat: () => {},
		equal: () => {},
		getFirstChar: () => {},
		getLength: () => {},
		retainNumber: () => {},
		phoneVerification: () => {},
		phoneNumberSplit: () => {},
		judgeMultipleEqual: () => {},
		judgeFillinAll: () => {},
		judgeAllTrue: () => {},
		judgesFillinAll: () => {},
		strLenx: () => {},
	},
	typeCheck: {
		phoneNumber: () => {},
		userName: () => {},
	},
	utils: {
		base64ToBlob: () => {},
		exists: () => {},
		prepareDoc: () => {},
		prepareDocToPath: () => {},
		alert: () => {},
		getCountryCode: () => {},
		getPhoneNumber: () => {},
	},
	uploadDocument: async () => {},
}

;(async () => {
	const aggregator = new Aggregator(configKey)
	const args = { refs, root: aggregator.root }
	const rootConfig = await aggregator.loadRootConfig(configKey)
	parse({ context: configKey, doc: rootConfig, ...args })
	const appConfig = await aggregator.loadAppConfig(rootConfig)
	parse({ context: aggregator.appKey, doc: appConfig, ...args })

	await aggregator.loadPreloadPages()

	const baseDataModel = aggregator.root.get('BaseDataModel')

	for (const pair of baseDataModel.contents.items) {
		const key = pair.key
		const node = baseDataModel.get(key)
		parse({ context: key, doc: node, ...args })
	}

	const signInPage = await aggregator.loadPage('SignIn')

	parse({ context: 'SignIn', doc: signInPage, ...args })

	// for (const node of appConfig.get('preload').items) {
	// const context = node.value
	// const preloadedDoc = aggregator.root.get(context)
	// parse({ context, doc: preloadedDoc, ...args })
	// }

	await fs.writeJson(pathToOutputFile, refs, { spaces: 2 })
})()
