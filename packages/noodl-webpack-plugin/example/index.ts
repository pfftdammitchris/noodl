import * as u from '@jsmanifest/utils'
import { NUI } from 'noodl-ui'
import NDOM from 'noodl-ui-dom'

window.addEventListener('load', async (event) => {
	const { default: NoodlSdk } = await import('@aitmed/cadl')
	const ndom = new NDOM()
	const page = ndom.createPage({ viewport: { width: 300, height: 667 } })

	let sdk = new NoodlSdk({
		aspectRatio: 1,
		cadlVersion: 'test',
		configUrl: `http://127.0.0.1:3001/testpage.yml`,
	})

	const resetSdk = () => {
		return (sdk = new NoodlSdk({
			aspectRatio: 1,
			cadlVersion: 'test',
			configUrl: `http://127.0.0.1:3001/testpage.yml`,
		}))
	}

	resetSdk()
	await sdk.init()

	NUI.use({
		getAssetsUrl: () => sdk.assetsUrl,
		getBaseUrl: () => sdk.cadlBaseUrl,
		getPages: () => sdk.cadlEndpoint.page,
		getPreloadPages: () => sdk.cadlEndpoint.preload,
		getRoot: () => sdk.root,
	})

	const goto = async (s) => {
		console.log(s)
		window.location.href = s
	}

	ndom.use({
		emit: {
			onClick: async (action, opts) => {
				console.log({ action, ...opts })
			},
		},
		goto,
		builtIn: {
			goto,
		},
		transaction: {
			async 'register-page-object'(page) {
				try {
					await sdk.initPage(page.requesting, [])
					return sdk.root[page.page]
				} catch (error) {
					console.error(error)
				}
			},
		},
	})

	ndom.page.page = 'Index'
	const req = await ndom.request(ndom.page)
	req && req.render()

	window['sdk'] = sdk
	console.log(`sdk`, sdk)

	for (const key of u.keys(sdk.root)) {
		const descriptor = Object.getOwnPropertyDescriptor(sdk.root, key)
		if ('value' in descriptor) {
			let value = descriptor.value
			Object.defineProperty(sdk.root, key, {
				get() {
					console.log(`Getting: ${key}`, descriptor)
					return value
				},
				set(val) {
					value = val
				},
			})
		} else {
			Object.defineProperty(sdk.root, key, descriptor)
		}
	}

	const allPageNames = [...NUI.getPreloadPages(), ...NUI.getPages()]
	// console.log(`All page names`, allPageNames)

	const ws = new WebSocket(`ws://127.0.0.1:3002`)

	ws.onopen = (event) => {
		console.log(
			`%cConnected to noodl-webpack-plugin`,
			`color:limegreen;`,
			event,
		)
	}

	ws.onclose = (event) => {
		console.log(`%cnoodl-webpack-plugin closed`, `color:red;`, event)
	}

	ws.onerror = (event) => {
		console.log(
			`%cnoodl-webpack-plugin received an error!`,
			`color:#ec0000;`,
			event,
		)
	}

	ws.onmessage = async (event) => {
		const data = JSON.parse(event.data)

		console.log(
			`%cWebsocket client received a message!`,
			`color:#00b406;`,
			data,
		)

		if (data.type === 'FILE_CHANGED') {
			const pageName = data.name
			console.log(
				`%cA yml file was changed. Reloading the app now...`,
				`color:#e50087;`,
				data,
			)
			console.clear()
			resetSdk()
			await sdk.init()

			ndom.page.getNuiPage().object().components = []
			ndom.page.components = []
			ndom.cache.component.clear()
			// ndom.page.rootNode.textContent = ''
			// ndom.page.clearRootNode()
			ndom.page = ndom.page.setPreviousPage(
				ndom.page.getPreviousPage(sdk.cadlEndpoint.startPage),
			)
			ndom.page.requesting = pageName
			const req = await ndom.request(ndom.page)
			req && req.render()
		}
	}
})
