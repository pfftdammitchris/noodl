import React from 'react';
// @ts-expect-error
import { WebSocketServer } from 'ws';
import * as c from '../constants.js';
function useWss({ host = c.DEFAULT_SERVER_HOSTNAME, port = c.DEFAULT_WSS_PORT, ...options } = {}) {
    const wss = React.useRef(null);
    const connect = React.useCallback((opts) => {
        wss.current = new WebSocketServer({ ...options, host, port });
        opts?.onClose && wss.current?.on('close', opts.onClose);
        opts?.onConnection && wss.current?.on('connection', opts.onConnection);
        opts?.onError && wss.current?.on('error', opts.onError);
        opts?.onHeaders && wss.current?.on('headers', opts.onHeaders);
        opts?.onListening && wss.current?.on('listening', opts.onListening);
    }, []);
    const sendMessage = React.useCallback((msg) => {
        return new Promise((resolve, reject) => {
            wss.current?.clients?.forEach((client) => {
                client.send(JSON.stringify(msg, null, 2), (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve(undefined);
                });
            });
        });
    }, []);
    return {
        connect,
        sendMessage,
        wss,
    };
}
export default useWss;
//# sourceMappingURL=useWss.js.map