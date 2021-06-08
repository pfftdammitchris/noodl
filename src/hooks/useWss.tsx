import React from 'react'
import { IncomingMessage } from 'http'
import WebSocket from 'ws'
import * as c from '../constants'

export interface Options {
	host?: string
	port?: number
	onListening?(this: WebSocket.Server): void
	onConnection?(
		this: WebSocket.Server,
		socket: WebSocket,
		request: IncomingMessage,
	): void
	onClose?(this: WebSocket.Server): void
	onError?(this: WebSocket.Server, error: Error): void
	onHeaders?(
		this: WebSocket.Server,
		headers: string[],
		request: IncomingMessage,
	): void
}

function useWss({
	host = c.DEFAULT_SERVER_HOSTNAME,
	port = c.DEFAULT_WSS_PORT,
	onConnection,
	onClose,
	onError,
	onHeaders,
	onListening,
}: Options = {}) {
	const wss = React.useRef<WebSocket.Server | null>(null)

	const connect = React.useCallback(() => {
		wss.current = new WebSocket.Server({ host, port })
		onClose && wss.current.on('close', onClose)
		onConnection && wss.current.on('connection', onConnection)
		onError && wss.current.on('error', onError)
		onHeaders && wss.current.on('headers', onHeaders)
		onListening && wss.current.on('listening', onListening)
	}, [])

	const sendMessage = React.useCallback((msg: Record<string, any>) => {
		return new Promise((resolve, reject) => {
			wss.current?.clients.forEach((client) => {
				client.send(JSON.stringify(msg, null, 2), (err) => {
					if (err) reject(err)
					else resolve(undefined)
				})
			})
		})
	}, [])

	return {
		connect,
		sendMessage,
		wss,
	}
}

export default useWss
