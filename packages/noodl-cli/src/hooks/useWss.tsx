import React from 'react'
import type { IncomingMessage } from 'http'
// @ts-expect-error
import { WebSocketServer } from 'ws'
import type { Server, ServerOptions } from 'ws'
import * as c from '../constants.js'

const WebsocketServer = WebSocketServer as Server

export interface Hooks {
	onListening?(this: any): void
	onConnection?(this: any, socket: any, request: IncomingMessage): void
	onClose?(this: any): void
	onError?(this: any, error: Error): void
	onHeaders?(this: any, headers: string[], request: IncomingMessage): void
}

function useWss({
	host = c.DEFAULT_SERVER_HOSTNAME,
	port = c.DEFAULT_WSS_PORT,
	...options
}: ServerOptions = {}) {
	const wss = React.useRef<typeof WebsocketServer | null>(null)

	const connect = React.useCallback((opts?: Hooks) => {
		// @ts-expect-error
		wss.current = new WebsocketServer({ ...options, host, port })
		opts?.onClose && wss.current?.on('close', opts.onClose)
		opts?.onConnection && wss.current?.on('connection', opts.onConnection)
		opts?.onError && wss.current?.on('error', opts.onError)
		opts?.onHeaders && wss.current?.on('headers', opts.onHeaders)
		opts?.onListening && wss.current?.on('listening', opts.onListening)
	}, [])

	const sendMessage = React.useCallback((msg: Record<string, any>) => {
		return new Promise((resolve, reject) => {
			wss.current?.clients?.forEach((client) => {
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
