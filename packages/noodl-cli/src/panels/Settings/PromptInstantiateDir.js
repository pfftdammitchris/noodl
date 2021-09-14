import * as u from '@jsmanifest/utils';
import React from 'react';
import { Box, Newline, Text } from 'ink';
import Select from '../../components/Select.js';
import useCtx from '../../useCtx.js';
import useSettingsCtx from './useSettingsCtx.js';
import * as co from '../../utils/color.js';
import * as c from './constants.js';
function PromptInstantiateDir({ onReady }) {
    const { configuration, log } = useCtx();
    const { key, dir, setPrompt } = useSettingsCtx();
    const onSelect = React.useCallback((item) => {
        if (item.value) {
            configuration.setPathToGenerateDir(dir, {
                onCreated(path) {
                    log(`Created a new folder at ${co.yellow(path)}`);
                    setPrompt({ key: '' });
                    onReady?.();
                },
                onError({ error, path: pathToGenerateDir }) {
                    if (error.code == 'EACCES') {
                        log(u.red(`Permission was denied to create folder at ${co.yellow(pathToGenerateDir)}. Try another path`));
                    }
                    else {
                        console.error(`[${error.name}/${error.code}] ${error.message}`);
                    }
                },
            });
        }
        else {
            setPrompt({ key: c.prompts.ASK_GENERATE_PATH });
        }
    }, [configuration, key, dir]);
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, { color: "white" },
            "The path ",
            co.yellow(dir),
            " does not exist. Would you like for it to be created?"),
        React.createElement(Newline, null),
        React.createElement(Select, { items: [
                { value: true, label: 'Yes' },
                { value: false, label: `No` },
            ], onSelect: onSelect })));
}
export default PromptInstantiateDir;
//# sourceMappingURL=PromptInstantiateDir.js.map