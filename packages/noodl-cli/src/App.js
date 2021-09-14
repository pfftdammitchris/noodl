import * as u from '@jsmanifest/utils';
import { Box, Newline, Static, Text, useApp } from 'ink';
import merge from 'lodash/merge.js';
import React from 'react';
import { produce } from 'immer';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import NoodlAggregator from 'noodl-aggregator';
import Select from './components/Select.js';
import HighlightedText from './components/HighlightedText.js';
import Spinner from './components/Spinner.js';
import Settings from './panels/Settings/Settings.js';
import GenerateApp from './panels/GenerateApp.js';
import useConfiguration from './hooks/useConfiguration.js';
import Server from './panels/Server.js';
import { Provider } from './useCtx.js';
import * as co from './utils/color.js';
import * as c from './constants.js';
// @ts-expect-error
const { default: Aggregator } = NoodlAggregator;
const aggregator = new Aggregator();
export const initialState = {
    ready: false,
    activePanel: '',
    highlightedPanel: '',
    spinner: false,
    text: [],
};
function Application({ cli }) {
    const [state, _setState] = React.useState(initialState);
    const { exit } = useApp();
    const configuration = useConfiguration({ cli });
    const set = React.useCallback((fn) => void _setState(produce((draft) => {
        if (u.isStr(fn))
            draft.activePanel = fn;
        else if (u.isFnc(fn))
            fn(draft);
        else if (u.isObj(fn))
            merge(draft, fn);
    })), []);
    const ctx = {
        ...state,
        aggregator,
        cli,
        configuration,
        exit,
        set,
        highlight: (id) => set((d) => void (d.highlightedPanel = id)),
        log: (text) => set((d) => void d.text.push(text)),
        logError: (err) => set((d) => void d.text.push(err instanceof Error
            ? `[${u.red(err.name)}]: ${u.yellow(err.message)}`
            : err)),
        toggleSpinner: (type) => set((d) => void (d.spinner = u.isUnd(type)
            ? 'point'
            : type === false
                ? false
                : type)),
        setPanel: (panelKey) => {
            set((d) => void (d.activePanel = panelKey));
        },
    };
    React.useEffect(() => {
        if (u.keys(cli.flags).length) {
            const handleGenerate = () => {
                const generate = cli.flags.generate;
                if (generate || u.isStr(generate)) {
                    ctx.setPanel('generateApp');
                }
                else {
                    u.log(co.red(`Invalid generate operation: "${co.white(generate)}"\n` +
                        `Supported options are: ${co.yellow('app')}\n`));
                    exit();
                }
            };
            const handleServer = () => {
                if (cli.flags.server === true) {
                    ctx.setPanel('server');
                }
                else if (u.isStr(cli.flags.server)) {
                    ctx.setPanel('server');
                }
            };
            if (cli.flags.generate)
                handleGenerate();
            else if (cli.flags.server)
                handleServer();
            else
                ctx.setPanel(c.DEFAULT_PANEL);
        }
        else {
            ctx.setPanel(c.DEFAULT_PANEL);
        }
    }, []);
    //
    return (React.createElement(Provider, { value: ctx },
        state.activePanel === c.DEFAULT_PANEL && (React.createElement(Gradient, { name: "vice" },
            React.createElement(BigText, { text: "noodl-cli", font: "tiny", letterSpacing: 1 }),
            ' ',
            React.createElement(Text, { color: "white", bold: true }, cli.pkg.version),
            React.createElement(Newline, null))),
        !state.ready ? (React.createElement(Settings, { onReady: () => set({ ready: true, activePanel: state.activePanel }), pathToOutputDir: (cli.flags.outDir ||
                cli.flags.out ||
                cli.flags.generatePath), tempDir: cli.flags.out })) : state.activePanel === 'generateApp' ? (React.createElement(GenerateApp, { config: cli.flags.config, configVersion: cli.flags.version, isLocal: !cli.flags.remote, port: cli.flags.port, onEnd: () => cli.flags.server && ctx.setPanel('server'), isTemp: !!cli.flags.out })) : state.activePanel === 'server' ? (React.createElement(Server, { config: (u.isStr(cli.flags.server) && cli.flags.server) ||
                cli.flags.config, isConfigFromServerFlag: u.isStr(cli.flags.server) && !!cli.flags.server, port: cli.flags.port, isRemote: !!cli.flags.remote, wss: cli.flags.wss ? { port: cli.flags.wssPort } : undefined })) : (React.createElement(Box, { paddingLeft: 1, flexDirection: "column" },
            React.createElement(Text, { color: "whiteBright" },
                "What would you like to do? (",
                React.createElement(Text, { dimColor: true },
                    "Use ",
                    React.createElement(Text, { color: "yellow" }, "--help"),
                    " to see all options"),
                ")"),
            React.createElement(Box, { minHeight: 1 }),
            React.createElement(Select, { items: [
                    {
                        value: 'generateApp',
                        label: 'Generate an entire noodl app using a config',
                    },
                    {
                        value: 'server',
                        label: 'Start noodl development server (generate files first or provide them)',
                    },
                ], onSelect: (item) => {
                    // @ts-expect-error
                    switch (item.value) {
                        case 'generateApp':
                            return ctx.setPanel('generateApp');
                        case 'server':
                            return ctx.setPanel('server');
                        default:
                            return '';
                    }
                } }),
            React.createElement(Newline, { count: 1 }))),
        React.createElement(Static, { items: ctx.text }, (text, index) => React.createElement(Text, { key: index }, text)),
        ctx.spinner ? (React.createElement(HighlightedText, { color: "whiteBright" },
            React.createElement(Spinner, { type: ctx.spinner }))) : null));
}
export default Application;
//# sourceMappingURL=App.js.map