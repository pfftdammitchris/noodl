window.addEventListener('load', async (event) => {
	const { default: NoodlSdk } = await import('@aitmed/cadl')
	const { constants: c } = await import('..')

	const sdk = new NoodlSdk({
		aspectRatio: 1,
		cadlVersion: 'test',
		configUrl: `https://public.aitmed.com/config/aitmed.yml`,
	})

	window['sdk'] = sdk

	console.log(`Initiated SDK`, sdk)
	console.log(`DOM loaded`, event)

	const ws = new WebSocket(`ws://127.0.0.1:3002`)

	ws.onopen = (event) => {
		console.log(`%cWebSocket client opened!`, `color:#00b406;`, event)
	}

	ws.onclose = (event) => {
		console.log(`%cWebsocket client closed`, `color:#00b406;`, event)
	}

	ws.onerror = (event) => {
		console.log(
			`%cWebsocket client received an error!`,
			`color:#ec0000;`,
			event,
		)
	}

	ws.onmessage = async (event) => {
		const data = JSON.parse(event.data)

		if (data.type === c.FILE_CHANGED) {
			const pageName = data.name
			if (pageName && [].includes(pageName)) {
				console.log(
					`%cA yml file was changed. Reloading the app now...`,
					`color:#e50087;`,
					data,
				)
				console.clear()
			}
		}

		console.log(
			`%cWebsocket client received a message!`,
			`color:#00b406;`,
			data,
		)
	}
})
