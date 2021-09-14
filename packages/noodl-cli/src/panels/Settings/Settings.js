import React from 'react';
import Panel from '../../components/Panel.js';
import Init from './Init.js';
import OutputDir from './OutputDir.js';
import PromptDir from './PromptDir.js';
import PromptInstantiateDir from './PromptInstantiateDir.js';
import { Provider as SettingsProvider } from './useSettingsCtx.js';
import useCtx from '../../useCtx.js';
import { DEFAULT_OUTPUT_DIR } from '../../constants.js';
import * as c from './constants.js';
function Settings({ onReady, pathToOutputDir, tempDir, }) {
    const [key, setKey] = React.useState('');
    const [dir, setDir] = React.useState('');
    const { configuration, log } = useCtx();
    React.useEffect(() => {
        if (configuration.isFresh()) {
            ctx.setPrompt({ key: c.prompts.INIT });
        }
        else if (pathToOutputDir) {
            if (tempDir) {
                setDir(tempDir);
                onReady?.();
            }
            else {
                ctx.setPrompt({ key: c.prompts.SET_OUTPUT_DIR });
            }
        }
        else if (!configuration.getPathToGenerateDir()) {
            ctx.setPrompt({ key: c.prompts.ASK_GENERATE_PATH });
        }
        else {
            ctx.setPrompt({ key: '' });
            onReady?.();
        }
    }, []);
    const ctx = {
        key,
        dir,
        setPrompt: React.useCallback((prompt) => {
            prompt?.key && setKey(prompt.key);
            prompt?.dir && setDir(prompt.dir);
        }, []),
    };
    return (React.createElement(SettingsProvider, { value: ctx },
        React.createElement(Panel, { newline: false }, key ? (key === c.prompts.INIT ? (React.createElement(Init, { onReady: onReady })) : key === c.prompts.SET_OUTPUT_DIR ? (React.createElement(OutputDir, { value: pathToOutputDir || DEFAULT_OUTPUT_DIR, onConfirm: onReady })) : key === c.prompts.ASK_GENERATE_PATH ? (React.createElement(PromptDir, { onReady: onReady })) : key === c.prompts.ASK_INSTANTIATE_GENERATE_PATH ? (React.createElement(PromptInstantiateDir, { onReady: onReady })) : null) : null)));
}
export default Settings;
//# sourceMappingURL=Settings.js.map