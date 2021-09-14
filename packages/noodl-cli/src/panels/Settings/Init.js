import * as u from '@jsmanifest/utils';
import { Newline, Text } from 'ink';
import fs from 'fs-extra';
import React from 'react';
import HighlightedText from '../../components/HighlightedText.js';
import Select from '../../components/Select.js';
import useCtx from '../../useCtx.js';
import useSettingsCtx from './useSettingsCtx.js';
import * as co from '../../utils/color.js';
import * as c from './constants.js';
function SettingsInit({ onReady }) {
    const { configuration, log } = useCtx();
    const { setPrompt } = useSettingsCtx();
    const onSelect = React.useCallback((item) => {
        configuration.initTimestamp();
        if (item.value) {
            configuration.setPathToGenerateDir('default', {
                onCreated(path) {
                    return log(`Created a new folder at ${co.yellow(path)}`);
                },
                onError({ error, path }) {
                    if (error.code == 'EACCES') {
                        log(u.red(`Could not create dir at "${path}". Permission was denied.`));
                    }
                    else if (!fs.existsSync(path)) {
                        setPrompt({
                            key: c.prompts.ASK_INSTANTIATE_GENERATE_PATH,
                            dir: path,
                        });
                    }
                    else {
                        console.error(`Error creating folder at ${path}: ${error.message}`);
                    }
                },
            });
            onReady?.();
        }
        else {
            setPrompt({ key: c.prompts.ASK_GENERATE_PATH });
        }
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(HighlightedText, null, "Welcome!"),
        React.createElement(Text, null, "It seems like this is your first time using this app."),
        React.createElement(Text, null,
            "The default directory for generating output will be set to",
            ' ',
            React.createElement(Text, { color: "yellow" }, configuration.getDefaultGenerateDir())),
        React.createElement(Text, null, "Would you like to continue with this setting?"),
        React.createElement(Newline, null),
        React.createElement(Select, { onSelect: onSelect, items: [
                { value: true, label: 'Yes' },
                { value: false, label: `No. Set a different location` },
            ] }),
        React.createElement(Newline, null)));
}
export default SettingsInit;
//# sourceMappingURL=Init.js.map