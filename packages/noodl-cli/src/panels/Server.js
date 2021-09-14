import * as u from '@jsmanifest/utils';
import * as nc from 'noodl-common';
import React from 'react';
import { Box, Newline, Text } from 'ink';
import { globbySync } from 'globby';
import yaml from 'yaml';
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { ensureSlashPrefix } from '../utils/common.js';
import TextInput from '../components/TextInput.js';
import useCtx from '../useCtx.js';
import useConfigInput from '../hooks/useConfigInput.js';
import useWatcher from '../hooks/useWatcher.js';
import useWss from '../hooks/useWss.js';
import * as c from '../constants.js';
import * as co from '../utils/color.js';
function Server({ config: initialConfigValue, host = c.DEFAULT_SERVER_HOSTNAME, isRemote, port = c.DEFAULT_SERVER_PORT, watch: enableWatch, wss: wssProp, }) {
    const ref = React.useRef(null);
    const { aggregator, configuration, log, toggleSpinner } = useCtx();
    const getDir = React.useCallback((...s) => path.join(configuration.getPathToGenerateDir(), aggregator.configKey, ...s), []);
    const getServerUrl = React.useCallback(() => `http://${host}:${port}`, []);
    const getWatchGlob = React.useCallback(() => path.join(getDir(), '**/*'), []);
    /* -------------------------------------------------------
        ---- Config Input
    -------------------------------------------------------- */
    const { config, inputValue: configInput, setInputValue: setConfigInputValue, isNotFound, lastTried: lastConfigSubmitted, validate, validating, } = useConfigInput({
        initialValue: initialConfigValue,
        onValidated(configKey) {
            if (aggregator.configKey !== configKey) {
                aggregator.configKey = configKey;
                aggregator.init({}).finally(() => listen());
            }
            else {
                listen();
            }
        },
        onValidateStart(configValue) {
            toggleSpinner();
        },
        onValidateEnd() {
            toggleSpinner(false);
        },
        onNotFound() { },
        onError(error) {
            log(`[${u.red(error.name)}] ${u.yellow(error.message)}`);
        },
    });
    /* -------------------------------------------------------
        ---- WebSocket
    -------------------------------------------------------- */
    const { wss, connect: connectToWss, sendMessage, } = useWss({
        host,
        port: wssProp?.port,
    });
    /* -------------------------------------------------------
        ---- Watcher
    -------------------------------------------------------- */
    const { tag: watchTag, watch, watcher, watching, } = useWatcher({
        watchOptions: { followSymlinks: true },
    });
    const getLocalFilesAsMetadata = React.useCallback(() => {
        function reducer(acc, filepath) {
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {
                if (filepath.includes('/assets')) {
                    acc.assets.push(nc.getFileStructure(filepath, { config: aggregator.configKey }));
                }
                else {
                    acc.yml.push(nc.getFileStructure(filepath, { config: aggregator.configKey }));
                }
            }
            return acc;
        }
        const localFiles = globbySync(getWatchGlob().replace(/\\/g, '/'));
        log(`Picked up ${u.yellow(String(localFiles.length))} local files to register routes with\n`);
        const metadata = u.reduce(localFiles, reducer, { assets: [], yml: [] });
        return metadata;
    }, []);
    /* -------------------------------------------------------
        ---- Connect to server
    -------------------------------------------------------- */
    const connect = React.useCallback(() => {
        ref.current = express();
        ref.current.get(['/HomePageUrl', '/HomePageUrl_en.yml', '/HomePageUrl.yml'], (req, res) => res.send(''));
        ref.current.get(['/cadlEndpoint', '/cadlEndpoint.yml', '/cadlEndpoint_en.yml'], (req, res) => res.sendFile(getDir('cadlEndpoint.yml')));
    }, []);
    /* -------------------------------------------------------
        ---- Start listening on the server
    -------------------------------------------------------- */
    const listen = React.useCallback(() => {
        const metadata = getLocalFilesAsMetadata();
        connect();
        registerRoutes(metadata);
        /* -------------------------------------------------------
            ---- Start server
        -------------------------------------------------------- */
        ref.current?.listen({ cors: { origin: '*' }, port }, () => {
            log(`\n🚀 Server ready at ${co.cyan(getServerUrl())} ${aggregator.configKey
                ? `using config ${co.yellow(aggregator.configKey)}`
                : ''}`);
            if (wssProp) {
                connectToWss({
                    onConnection(socket) {
                        u.newline();
                        socket.on('message', (message) => log(`Received: ${message}`));
                    },
                    onClose() {
                        log(co.white(`WebSocket server has closed`));
                    },
                    onError(err) {
                        log(co.red(`[${err.name}] ${err.message}`));
                    },
                    onListening() {
                        log(`🚀 Wss is listening at: ${co.cyan(`ws://${host}:${wssProp.port || c.DEFAULT_WSS_PORT}`)}`);
                    },
                });
            }
            if (enableWatch) {
                watch({
                    watchGlob: getWatchGlob(),
                    onReady(watchedFiles, watchCount) {
                        log(`\n${watchTag} Watching ${co.yellow(watchCount)} files for changes at ${co.magenta(getDir())}\n`);
                        sendMessage({ type: 'WATCHING' });
                    },
                    onAdd(args) {
                        u.log(`${watchTag} file added`, args.path);
                        const metadata = nc.getFileStructure(path.isAbsolute(args.path)
                            ? args.path
                            : nc.getAbsFilePath(args.path), { config: aggregator.configKey });
                        if (args.path.includes('/assets')) {
                            registerRoutes({ assets: [metadata] });
                        }
                        else if (args.path.endsWith('yml')) {
                            registerRoutes({ yml: [metadata] });
                        }
                        sendMessage({ type: 'FILE_ADDED', ...args });
                    },
                    onAddDir(args) {
                        u.log(`${watchTag} folder added`, args.path);
                        sendMessage({ type: 'FOLDER_ADDED', ...args });
                    },
                    onChange(args) {
                        u.log(`${watchTag} file changed`, args.path);
                        sendMessage({ type: 'FILE_CHANGED', ...args });
                    },
                    onError(err) {
                        u.log(`${watchTag} error`, err);
                        sendMessage({ type: 'WATCH_ERROR', error: err });
                    },
                    onUnlink(filepath) {
                        u.log(`${watchTag} file was removed`, filepath);
                        sendMessage({ type: 'FILE_REMOVED', filepath });
                    },
                    onUnlinkDir(filepath) {
                        u.log(`${watchTag} folder was removed`, filepath);
                        sendMessage({ type: 'FOLDER_REMOVED', filepath });
                    },
                });
            }
        });
    }, []);
    /* -------------------------------------------------------
        ---- Creating the routes
    -------------------------------------------------------- */
    const registerRoutes = React.useCallback((metadata) => {
        /* -------------------------------------------------------
            ---- YML (Pages and other root level objects)
        -------------------------------------------------------- */
        if (metadata.yml) {
            for (let { group, filepath, filename } of metadata.yml) {
                filename = ensureSlashPrefix(filename);
                filename.endsWith('.yml') && (filename = filename.replace('.yml', ''));
                // Config (ex: meet4d.yml)
                if (filename.includes(aggregator.configKey)) {
                    group = 'config';
                    if (!isRemote) {
                        ref.current?.get([filename, `${filename}.yml`, `${filename}_en.yml`], (req, res) => {
                            const yml = fs.readFileSync(filepath, 'utf8');
                            const doc = yaml.parseDocument(yml);
                            doc.set('cadlBaseUrl', `http://${host}:${port}/`);
                            doc.has('myBaseUrl') &&
                                doc.set('myBaseUrl', `http://${host}:${port}/`);
                            res.send(doc.toString());
                        });
                    }
                    else {
                        ref.current?.get([filename, `${filename}.yml`, `${filename}_en.yml`], (req, res) => res.sendFile(filepath));
                    }
                }
                // Pages (ex: SignIn.yml)
                else {
                    group = 'page';
                    ref.current?.get([filename, `${filename}.yml`, `${filename}_en.yml`], (req, res) => res.sendFile(filepath));
                }
                log(co.white(`Registered route: ${co.yellow(filename)} [${co.magenta(group)}]`));
            }
        }
        /* -------------------------------------------------------
            ---- ASSETS
        -------------------------------------------------------- */
        if (metadata.assets) {
            for (let { filepath, filename, ext = '' } of metadata.assets) {
                let middlePaths = '';
                filename = ensureSlashPrefix(filename);
                if (filepath.includes('assets/')) {
                    middlePaths = filepath.substring(filepath.indexOf('assets/') + 'assets/'.length);
                    middlePaths = middlePaths.substring(0, middlePaths.indexOf(filename));
                    if (middlePaths && !middlePaths.endsWith('.')) {
                        middlePaths += '/';
                    }
                }
                const assetPath = `/assets/${middlePaths}${filename.replace('/', '')}${ext}`;
                ref.current?.get([assetPath], (req, res) => res.sendFile(filepath));
            }
        }
    }, [aggregator.configKey]);
    if (!config) {
        return (React.createElement(Box, { padding: 1, flexDirection: "column" }, validating ? (React.createElement(Text, { color: "white" },
            "Validating",
            ' ',
            React.createElement(Text, { color: "yellow" }, configInput || initialConfigValue),
            React.createElement(Text, null, "..."))) : (React.createElement(React.Fragment, null,
            React.createElement(Text, null,
                "What config should we use? (example:",
                ' ',
                React.createElement(Text, { color: "yellow" }, "meet4d"),
                ")"),
            React.createElement(Newline, null),
            React.createElement(TextInput, { value: configInput, onChange: setConfigInputValue, onSubmit: validate, placeholder: `Enter config` }),
            React.createElement(Newline, null),
            isNotFound ? (React.createElement(Text, { color: "red" },
                "The config \"",
                React.createElement(Text, { color: "yellow" }, lastConfigSubmitted),
                "\" does not exist")) : null))));
    }
    return null;
}
export default Server;
//# sourceMappingURL=Server.js.map