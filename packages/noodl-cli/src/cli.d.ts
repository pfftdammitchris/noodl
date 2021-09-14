#!/usr/bin/env node
export declare type Cli = typeof cli;
declare const cli: import("meow").Result<{
    config: {
        type: "string";
        alias: string;
        default: any;
    };
    generate: {
        type: "string";
        alias: string;
    };
    remote: {
        type: "boolean";
        alias: string;
        default: false;
    };
    out: {
        type: "string";
    };
    outDir: {
        type: "string";
    };
    port: {
        type: "number";
        alias: string;
        default: number;
    };
    server: {
        alias: string;
    };
    version: {
        type: "string";
        alias: string;
        default: string;
    };
    wss: {
        type: "boolean";
        default: true;
    };
    wssPort: {
        type: "number";
        default: number;
    };
}>;
export {};
