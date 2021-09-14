/// <reference types="node" />
import React from 'react';
import { IncomingMessage } from 'http';
import { ServerOptions } from 'ws';
export interface Hooks {
    onListening?(this: any): void;
    onConnection?(this: any, socket: any, request: IncomingMessage): void;
    onClose?(this: any): void;
    onError?(this: any, error: Error): void;
    onHeaders?(this: any, headers: string[], request: IncomingMessage): void;
}
declare function useWss({ host, port, ...options }?: ServerOptions): {
    connect: (opts?: Hooks | undefined) => void;
    sendMessage: (msg: Record<string, any>) => Promise<unknown>;
    wss: React.MutableRefObject<any>;
};
export default useWss;
