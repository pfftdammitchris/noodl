import React from 'react'
import { IncomingMessage } from 'http'
import WebSocket, { ServerOptions } from 'ws'
import * as c from '../constants'

export interface Hooks {
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
	...options
}: ServerOptions = {}) {
	const wss = React.useRef<WebSocket.Server | null>(null)

	const connect = React.useCallback((opts?: Hooks) => {
		wss.current = new WebSocket.Server({ ...options, host, port })
		opts?.onClose && wss.current.on('close', opts.onClose)
		opts?.onConnection && wss.current.on('connection', opts.onConnection)
		opts?.onError && wss.current.on('error', opts.onError)
		opts?.onHeaders && wss.current.on('headers', opts.onHeaders)
		opts?.onListening && wss.current.on('listening', opts.onListening)
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
